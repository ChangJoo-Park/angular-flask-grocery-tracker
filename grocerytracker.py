import datetime
from flask import Flask, jsonify
from flask_restful import Resource, Api, reqparse
from flask.ext.sqlalchemy import SQLAlchemy
from marshmallow import Schema, fields
from faker import Factory

app = Flask(__name__, static_url_path='')
api = Api(app)
datetime = datetime.datetime


# Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grocery.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)


""" Models """


class GroceryModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    price = db.Column(db.Integer)
    bought_at = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now)

    def __init__(self, name, price, bought_at):
        self.name = name
        self.price = price
        self.bought_at = bought_at

""" SCHEMAS """


# Grocery Schemas
class GrocerySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str()
    price = fields.Int()
    bought_at = fields.Date()


grocery_schema = GrocerySchema()
groceries_schema = GrocerySchema(many=True)
# Delete Remove All Groceries
try:
    db.drop_all(bind=None)
except:
    db.session.rollback()

# Create again db
db.create_all()

# Add dummy Groceries
numberOfDummies = 500
fake = Factory.create()
for x in range(0, numberOfDummies):
    from random import randint
    name = fake.name()
    price = randint(0, 100)
    bought_at = fake.date_time()  # '2006-04-30T03:01:38'
    grocery = GroceryModel(name, price, bought_at)
    db.session.add(grocery)
    db.session.commit()

# Serialize the query set
# API
# Parser for grocery
parser = reqparse.RequestParser()
parser.add_argument('name')
parser.add_argument('price')
parser.add_argument('bought_at')


# Grocery
# Show a single grocery item and lets you delete a grocery item
class Grocery(Resource):
    def find_by_id(self, id):
        return GroceryModel.query.filter(GroceryModel.id == id).first()

    def get(self, grocery_id):
        grocery = self.find_by_id(grocery_id)
        result = grocery_schema.dump(grocery)
        # abort_if_grocery_doesnt_exist(grocery_id)
        return jsonify({'data': result.data})

    def delete(self, grocery_id):
        grocery = self.find_by_id(grocery_id)
        db.session.delete(grocery)
        db.session.commit()
        return '', 204

    def put(self, grocery_id):
        print("START PUT")
        grocery = self.find_by_id(grocery_id)
        data = parser.parse_args()
        grocery.name = data["name"]
        grocery.price = data["price"]
        db.session.commit()
        result = grocery_schema.dump(grocery)
        return jsonify({'data': result.data})


# TodoList
# show s a list of all grocery, and lets you POST to add new grocery
class GroceryList(Resource):
    def get(self):
        gm = GroceryModel
        gmBoughtAt = gm.bought_at.desc()
        gmCreateAt = gm.created_at.desc()
        groceries = gm.query.order_by(gmBoughtAt, gmCreateAt).all()
        # Serialize the query set
        result = groceries_schema.dump(groceries)
        return jsonify({'data': result.data})

    def post(self):
        data = parser.parse_args()
        bought_at = datetime.strptime(data["bought_at"], "%Y-%m-%d")
        grocery = GroceryModel(data["name"], data["price"], bought_at)
        db.session.add(grocery)
        db.session.commit()
        return data, 201


# Setting API
api.add_resource(GroceryList, '/api/groceries', '/api/groceries/')
api.add_resource(Grocery, '/api/groceries/<int:grocery_id>')


# Routes
@app.route('/')
def index():
    return app.send_static_file("index.html")

if __name__ == "__main__":
    app.run(debug=True)
