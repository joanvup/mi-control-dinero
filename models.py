import uuid
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Source(db.Model):
    """Modelo para las fuentes de dinero (cuentas, efectivo, etc.)."""
    __tablename__ = 'sources'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    initial_balance = db.Column(db.Float, nullable=False, default=0.0)

    # Relación con transacciones
    transactions = db.relationship('Transaction', backref='source', lazy=True, cascade="all, delete-orphan")

    def to_dict(self, balance=0.0):
        return {
            'id': self.id,
            'name': self.name,
            'balance': balance
        }

class Transaction(db.Model):
    """Modelo para las transacciones (ingresos y gastos)."""
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(10), nullable=False)  # 'INCOME' or 'EXPENSE'
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    source_id = db.Column(db.Integer, db.ForeignKey('sources.id'), nullable=False)
    
    # UUID para vincular las dos transacciones de una transferencia
    transfer_id = db.Column(db.String(36), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'date': self.date.isoformat(),
            'description': self.description,
            'amount': self.amount,
            'category': self.category,
            'source_id': self.source_id,
            'source_name': self.source.name,
            'transfer_id': self.transfer_id
        }