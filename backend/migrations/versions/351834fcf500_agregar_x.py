"""Agregar x

Revision ID: 351834fcf500
Revises: cf3c47caedeb
Create Date: 2024-11-20 12:24:30.603406

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '351834fcf500'
down_revision = 'cf3c47caedeb'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Clientes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('razon_social', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('vip', sa.Boolean(), nullable=True))
        batch_op.alter_column('ruc',
               existing_type=sa.VARCHAR(length=20, collation='Modern_Spanish_CI_AS'),
               nullable=True)
        batch_op.alter_column('sociedades',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('empleados',
               existing_type=sa.INTEGER(),
               nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Clientes', schema=None) as batch_op:
        batch_op.alter_column('empleados',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('sociedades',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('ruc',
               existing_type=sa.VARCHAR(length=20, collation='Modern_Spanish_CI_AS'),
               nullable=False)
        batch_op.drop_column('vip')
        batch_op.drop_column('razon_social')

    # ### end Alembic commands ###
