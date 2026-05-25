"""merge migration heads

Revision ID: b669dc2cf1c5
Revises: dafffa18a9ec, e18afc588dfa
Create Date: 2026-05-25 13:54:22.167073

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b669dc2cf1c5'
down_revision: Union[str, None] = ('dafffa18a9ec', 'e18afc588dfa')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
