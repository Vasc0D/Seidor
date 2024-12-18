"""Agregar x

Revision ID: c4b091ecacd7
Revises: 351834fcf500
Create Date: 2024-11-22 11:45:56.675006

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c4b091ecacd7'
down_revision = '351834fcf500'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Clientes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('activo', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Clientes', schema=None) as batch_op:
        batch_op.drop_column('activo')

    # ### end Alembic commands ###
