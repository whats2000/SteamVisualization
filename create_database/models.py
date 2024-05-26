from sqlalchemy import Column, Integer, String, Float, Boolean, Text, Table, ForeignKey, DateTime
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

# Association tables for many-to-many relationships
game_developer = Table(
    'game_developer', Base.metadata,
    Column('game_id', Integer, ForeignKey('games.id')),
    Column('developer_id', Integer, ForeignKey('developers.id'))
)

game_publisher = Table(
    'game_publisher', Base.metadata,
    Column('game_id', Integer, ForeignKey('games.id')),
    Column('publisher_id', Integer, ForeignKey('publishers.id'))
)

game_category = Table(
    'game_category', Base.metadata,
    Column('game_id', Integer, ForeignKey('games.id')),
    Column('category_id', Integer, ForeignKey('categories.id'))
)

game_genre = Table(
    'game_genre', Base.metadata,
    Column('game_id', Integer, ForeignKey('games.id')),
    Column('genre_id', Integer, ForeignKey('genres.id'))
)

game_tag = Table(
    'game_tag', Base.metadata,
    Column('game_id', Integer, ForeignKey('games.id')),
    Column('tag_id', Integer, ForeignKey('tags.id'))
)


class Game(Base):
    __tablename__ = 'games'

    id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(String(20), unique=True, nullable=False)  # 指定長度
    name = Column(String(255), nullable=False)
    release_date = Column(DateTime)
    required_age = Column(Integer)
    price = Column(Float)
    dlc_count = Column(Integer)
    detailed_description = Column(Text)
    about_the_game = Column(Text)
    short_description = Column(Text)
    reviews = Column(Text)
    header_image = Column(String(255))
    website = Column(String(255))
    support_url = Column(String(255))
    support_email = Column(String(255))
    windows = Column(Boolean)
    mac = Column(Boolean)
    linux = Column(Boolean)
    metacritic_score = Column(Integer)
    metacritic_url = Column(String(255))
    achievements = Column(Integer)
    recommendations = Column(Integer)
    notes = Column(Text)
    supported_languages = Column(JSON)
    full_audio_languages = Column(JSON)
    screenshots = Column(JSON)
    movies = Column(JSON)
    user_score = Column(Float)
    score_rank = Column(String(255))
    positive = Column(Integer)
    negative = Column(Integer)
    estimated_owners = Column(String(255))
    average_playtime_forever = Column(Integer)
    average_playtime_2weeks = Column(Integer)
    median_playtime_forever = Column(Integer)
    median_playtime_2weeks = Column(Integer)
    peak_ccu = Column(Integer)
    packages = relationship("Package", back_populates="game")
    developers = relationship("Developer", secondary=game_developer, back_populates="games")
    publishers = relationship("Publisher", secondary=game_publisher, back_populates="games")
    categories = relationship("Category", secondary=game_category, back_populates="games")
    genres = relationship("Genre", secondary=game_genre, back_populates="games")
    tags = relationship("Tag", secondary=game_tag, back_populates="games")


class Package(Base):
    __tablename__ = 'packages'

    id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(Integer, ForeignKey('games.id'))
    title = Column(String(255))
    description = Column(Text)
    subs = Column(JSON)
    game = relationship("Game", back_populates="packages")


class Developer(Base):
    __tablename__ = 'developers'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True)
    games = relationship("Game", secondary=game_developer, back_populates="developers")


class Publisher(Base):
    __tablename__ = 'publishers'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True)
    games = relationship("Game", secondary=game_publisher, back_populates="publishers")


class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True)
    games = relationship("Game", secondary=game_category, back_populates="categories")


class Genre(Base):
    __tablename__ = 'genres'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True)
    games = relationship("Game", secondary=game_genre, back_populates="genres")


class Tag(Base):
    __tablename__ = 'tags'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True)
    games = relationship("Game", secondary=game_tag, back_populates="tags")
