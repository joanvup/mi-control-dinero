import os
import uuid
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from sqlalchemy import func
from models import db, Source, Transaction

# --- CONFIGURACIÓN DE LA APLICACIÓN ---
app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)  # Habilita CORS para toda la aplicación

# Usa una carpeta 'instance' para la base de datos SQLite
instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
os.makedirs(instance_path, exist_ok=True)

# Configuración por defecto para SQLite
# app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_path, "database.db")}'
# Para usar MySQL, comenta la línea anterior y descomenta la siguiente, ajustando tus credenciales:
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://dinerouser:S0portefcbv%401@localhost/mi_control_dinero_db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# --- COMANDO PARA INICIALIZAR LA BASE DE DATOS ---
@app.cli.command("init-db")
def init_db_command():
    """Crea las tablas de la base de datos y datos iniciales."""
    with app.app_context():
        db.create_all()
        # Añadir datos iniciales si no existen
        if not Source.query.first():
            efectivo = Source(name="Efectivo", initial_balance=500.0)
            banco = Source(name="Cuenta Bancaria", initial_balance=2500.0)
            db.session.add_all([efectivo, banco])
            db.session.commit()
            
            # Transacciones de ejemplo
            t1 = Transaction(type="INCOME", description="Salario", amount=1500, category="Salario", source_id=banco.id)
            t2 = Transaction(type="EXPENSE", description="Alquiler", amount=800, category="Vivienda", source_id=banco.id)
            t3 = Transaction(type="EXPENSE", description="Café", amount=5, category="Comida", source_id=efectivo.id)
            db.session.add_all([t1, t2, t3])
            db.session.commit()
            
        print("Base de datos inicializada.")

# --- HELPERS ---
def calculate_balance(source):
    """Calcula el saldo actual de una fuente."""
    total_income = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.source_id == source.id,
        Transaction.type == 'INCOME'
    ).scalar() or 0.0

    total_expense = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.source_id == source.id,
        Transaction.type == 'EXPENSE'
    ).scalar() or 0.0

    return source.initial_balance + total_income - total_expense

# --- RUTAS DE LA API RESTFUL ---

@app.route('/api/sources', methods=['GET'])
def get_sources():
    """Obtiene todas las fuentes de dinero con sus saldos."""
    sources = Source.query.all()
    sources_with_balances = [source.to_dict(balance=calculate_balance(source)) for source in sources]
    return jsonify(sources_with_balances)

@app.route('/api/sources', methods=['POST'])
def create_source():
    """Crea una nueva fuente de dinero."""
    data = request.get_json()
    if not data or 'name' not in data or 'initial_balance' not in data:
        return jsonify({'error': 'Datos incompletos'}), 400

    new_source = Source(name=data['name'], initial_balance=float(data['initial_balance']))
    db.session.add(new_source)
    db.session.commit()
    
    return jsonify(new_source.to_dict(balance=new_source.initial_balance)), 201

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Obtiene todas las transacciones, con opción de filtrar por fuente."""
    source_id = request.args.get('source_id')
    query = Transaction.query.order_by(Transaction.date.desc())
    if source_id:
        query = query.filter_by(source_id=source_id)
        
    transactions = [t.to_dict() for t in query.all()]
    return jsonify(transactions)

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    """Registra una nueva transacción (ingreso o gasto)."""
    data = request.get_json()
    required_fields = ['type', 'description', 'amount', 'category', 'source_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Faltan campos requeridos'}), 400

    new_transaction = Transaction(
        type=data['type'],
        description=data['description'],
        amount=float(data['amount']),
        category=data['category'],
        source_id=int(data['source_id'])
    )
    db.session.add(new_transaction)
    db.session.commit()
    
    return jsonify(new_transaction.to_dict()), 201

@app.route('/api/transfers', methods=['POST'])
def create_transfer():
    """Realiza una transferencia entre dos fuentes."""
    data = request.get_json()
    required_fields = ['from_source_id', 'to_source_id', 'amount', 'description']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Faltan campos requeridos'}), 400
    
    if data['from_source_id'] == data['to_source_id']:
        return jsonify({'error': 'Las cuentas de origen y destino no pueden ser la misma'}), 400

    transfer_uuid = str(uuid.uuid4())
    
    # Gasto en la fuente de origen
    expense = Transaction(
        type='EXPENSE',
        description=f"Transferencia a {Source.query.get(data['to_source_id']).name}: {data['description']}",
        amount=float(data['amount']),
        category='Transferencia',
        source_id=int(data['from_source_id']),
        transfer_id=transfer_uuid
    )
    
    # Ingreso en la fuente de destino
    income = Transaction(
        type='INCOME',
        description=f"Transferencia desde {Source.query.get(data['from_source_id']).name}: {data['description']}",
        amount=float(data['amount']),
        category='Transferencia',
        source_id=int(data['to_source_id']),
        transfer_id=transfer_uuid
    )
    
    db.session.add_all([expense, income])
    db.session.commit()
    
    return jsonify({'message': 'Transferencia realizada con éxito'}), 201

@app.route('/api/dashboard-data', methods=['GET'])
def get_dashboard_data():
    """Agrega y devuelve datos para el dashboard."""
    # Métricas principales
    total_income = db.session.query(func.sum(Transaction.amount)).filter_by(type='INCOME').scalar() or 0.0
    total_expense = db.session.query(func.sum(Transaction.amount)).filter_by(type='EXPENSE').scalar() or 0.0
    
    sources = Source.query.all()
    total_balance = sum(calculate_balance(s) for s in sources)

    # Datos para gráfico de Ingresos vs Gastos (últimos 6 meses)
    income_vs_expense_data = {'labels': [], 'income': [], 'expense': []}
    today = datetime.utcnow()
    for i in range(5, -1, -1):
        month_date = today - timedelta(days=i * 30)
        month_start = datetime(month_date.year, month_date.month, 1)
        
        # Encontrar el último día del mes
        next_month = month_start.replace(day=28) + timedelta(days=4)
        month_end = next_month - timedelta(days=next_month.day)

        month_label = month_start.strftime("%b %Y")
        
        income = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.type == 'INCOME',
            Transaction.date >= month_start,
            Transaction.date <= month_end
        ).scalar() or 0.0
        
        expense = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.type == 'EXPENSE',
            Transaction.date >= month_start,
            Transaction.date <= month_end
        ).scalar() or 0.0
        
        income_vs_expense_data['labels'].append(month_label)
        income_vs_expense_data['income'].append(income)
        income_vs_expense_data['expense'].append(expense)

    # Datos para gráfico de distribución de gastos
    expense_by_category = db.session.query(
        Transaction.category, func.sum(Transaction.amount)
    ).filter_by(type='EXPENSE').group_by(Transaction.category).all()
    
    expense_distribution_data = {
        'labels': [item[0] for item in expense_by_category],
        'data': [item[1] for item in expense_by_category]
    }
    
    # Transacciones recientes
    recent_transactions_query = Transaction.query.order_by(Transaction.date.desc()).limit(10).all()
    recent_transactions = [t.to_dict() for t in recent_transactions_query]

    return jsonify({
        'summary': {
            'total_income': total_income,
            'total_expense': total_expense,
            'total_balance': total_balance
        },
        'charts': {
            'income_vs_expense': income_vs_expense_data,
            'expense_distribution': expense_distribution_data
        },
        'recent_transactions': recent_transactions
    })

# --- RUTA PARA SERVIR EL FRONTEND ---
@app.route('/')
def index():
    """Sirve el archivo index.html principal."""
    return send_from_directory(app.template_folder, 'index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Asegura que la DB exista al iniciar
    app.run(debug=True)