"""Agregar id

Revision ID: 731b3ef15161
Revises: c51c9a5eb313
Create Date: 2024-10-09 11:33:19.634059

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '731b3ef15161'
down_revision = 'c51c9a5eb313'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Detalle_Conceptos', schema=None) as batch_op:
        batch_op.add_column(sa.Column('licencia_id', sa.String(length=255), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Detalle_Conceptos', schema=None) as batch_op:
        batch_op.drop_column('licencia_id')

    # ### end Alembic commands ###
