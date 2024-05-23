from sqlalchemy import Column, Integer, String, Text, Date, Float, Boolean, ForeignKey

from . import db

class Game(db.Model):
    __tablename__ = 'games'
    game_id = Column(Integer, primary_key=True)
    name = Column(String(255))
    release_date = Column(Date)
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
    user_score = Column(Integer)
    score_rank = Column(String(255))
    positive = Column(Integer)
    negative = Column(Integer)
    estimated_owners = Column(String(255))
    average_playtime_forever = Column(Integer)
    average_playtime_2weeks = Column(Integer)
    median_playtime_forever = Column(Integer)
    median_playtime_2weeks = Column(Integer)
    peak_ccu = Column(Integer)

class Package(db.Model):
    __tablename__ = 'packages'
    package_id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(Integer, ForeignKey('games.game_id'))
    title = Column(String(255))
    description = Column(Text)
    price = Column(Float)

class Category(db.Model):
    __tablename__ = 'categories'
    category_id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(Integer, ForeignKey('games.game_id'))
    category = Column(String(255))

class Genre(db.Model):
    __tablename__ = 'genres'
    genre_id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(Integer, ForeignKey('games.game_id'))
    genre = Column(String(255))

class Screenshot(db.Model):
    __tablename__ = 'screenshots'
    screenshot_id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(Integer, ForeignKey('games.game_id'))
    url = Column(String(255))

class Movie(db.Model):
    __tablename__ = 'movies'
    movie_id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(Integer, ForeignKey('games.game_id'))
    url = Column(String(255))

class Tag(db.Model):
    __tablename__ = 'tags'
    tag_id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(Integer, ForeignKey('games.game_id'))
    tag = Column(String(255))
    count = Column(Integer)
