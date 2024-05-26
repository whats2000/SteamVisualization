import json
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from tqdm import tqdm

from models import Base, Game, Package, Developer, Publisher, Category, Genre, Tag

DATABASE_URL = 'mysql+mysqlconnector://root:@localhost/steam_games'


def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%b %d, %Y")
    except ValueError:
        try:
            date_str_with_day = f"1 {date_str}"
            return datetime.strptime(date_str_with_day, "%d %b %Y")
        except ValueError:
            return None


def load_data(json_data):
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    for game_id, game_data in tqdm(json_data.items()):
        game = Game(
            game_id=game_id,
            name=game_data.get('name', ''),
            release_date=parse_date(game_data.get('release_date', '')),
            required_age=game_data.get('required_age', 0),
            price=game_data.get('price', 0.0),
            dlc_count=game_data.get('dlc_count', 0),
            detailed_description=game_data.get('detailed_description', ''),
            about_the_game=game_data.get('about_the_game', ''),
            short_description=game_data.get('short_description', ''),
            reviews=game_data.get('reviews', ''),
            header_image=game_data.get('header_image', ''),
            website=game_data.get('website', ''),
            support_url=game_data.get('support_url', ''),
            support_email=game_data.get('support_email', ''),
            windows=game_data.get('windows', False),
            mac=game_data.get('mac', False),
            linux=game_data.get('linux', False),
            metacritic_score=game_data.get('metacritic_score', 0),
            metacritic_url=game_data.get('metacritic_url', ''),
            achievements=game_data.get('achievements', 0),
            recommendations=game_data.get('recommendations', 0),
            notes=game_data.get('notes', ''),
            supported_languages=game_data.get('supported_languages', []),
            full_audio_languages=game_data.get('full_audio_languages', []),
            screenshots=game_data.get('screenshots', []),
            movies=game_data.get('movies', []),
            user_score=game_data.get('user_score', 0.0),
            score_rank=game_data.get('score_rank', ''),
            positive=game_data.get('positive', 0),
            negative=game_data.get('negative', 0),
            estimated_owners=game_data.get('estimated_owners', ''),
            average_playtime_forever=game_data.get('average_playtime_forever', 0),
            average_playtime_2weeks=game_data.get('average_playtime_2weeks', 0),
            median_playtime_forever=game_data.get('median_playtime_forever', 0),
            median_playtime_2weeks=game_data.get('median_playtime_2weeks', 0),
            peak_ccu=game_data.get('peak_ccu', 0),
        )

        for pkg in game_data.get('packages', []):
            package = Package(
                title=pkg.get('title', ''),
                description=pkg.get('description', ''),
                subs=pkg.get('subs', []),
            )
            game.packages.append(package)

        session.add(game)

        for dev_name in game_data.get('developers', []):
            developer = session.query(Developer).filter_by(name=dev_name).first()
            if not developer:
                developer = Developer(name=dev_name)
            game.developers.append(developer)

        for pub_name in game_data.get('publishers', []):
            publisher = session.query(Publisher).filter_by(name=pub_name).first()
            if not publisher:
                publisher = Publisher(name=pub_name)
            game.publishers.append(publisher)

        for cat_name in game_data.get('categories', []):
            category = session.query(Category).filter_by(name=cat_name).first()
            if not category:
                category = Category(name=cat_name)
            game.categories.append(category)

        for genre_name in game_data.get('genres', []):
            genre = session.query(Genre).filter_by(name=genre_name).first()
            if not genre:
                genre = Genre(name=genre_name)
            game.genres.append(genre)

        tags = game_data.get('tags', {})
        if isinstance(tags, dict):
            for tag_name, tag_count in tags.items():
                tag = session.query(Tag).filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                game.tags.append(tag)
        elif isinstance(tags, list):
            for tag_name in tags:
                tag = session.query(Tag).filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                game.tags.append(tag)

        session.add(game)

    session.commit()
    session.close()


if __name__ == "__main__":
    with open('create_database/games.json', 'r', encoding='utf-8') as file:
        data = json.load(file)
        load_data(data)
