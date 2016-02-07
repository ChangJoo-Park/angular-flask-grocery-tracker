import os
import logging
import datetime
from flask import Flask, jsonify, render_template
from flask_restful import Resource, Api, reqparse
from flask.ext.sqlalchemy import SQLAlchemy
from marshmallow import Schema, fields
from faker import Factory
from flask.ext.assets import Environment, Bundle

app = Flask(__name__, static_url_path='')
api = Api(app)
datetime = datetime.datetime

logger = logging.getLogger('GroceryTracker')
fomatter = '%(asctime)s - %(name)8s - %(levelname)8s - %(message)s'
logging.basicConfig(format=fomatter, level=logging.DEBUG)

# Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grocery.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)
# Delete Remove All Groceries
try:
    db.reflect()
    db.drop_all()
except:
    db.session.rollback()

""" Models """


class Grocery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    place = db.Column(db.String)
    price = db.Column(db.Float)
    quantity = db.Column(db.Integer)
    bought_at = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now)

    def __init__(self, name, place, price, quantity, bought_at):
        self.name = name
        self.place = place
        self.price = price
        self.quantity = quantity
        self.bought_at = bought_at

""" SCHEMAS """


# Grocery Schemas
class GrocerySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str()
    place = fields.Str()
    price = fields.Float()
    quantity = fields.Int()
    bought_at = fields.Date()
    created_at = fields.Date()
    updated_at = fields.Date()

grocery_schema = GrocerySchema()
groceries_schema = GrocerySchema(many=True)

# Create again db
db.create_all()

# Add dummy Groceries
numberOfDummies = 50
fake = Factory.create()
for x in range(0, numberOfDummies):
    from random import randint
    name = fake.name()
    price = randint(0, 100)
    quantity = randint(1, 10)
    place = fake.company()
    bought_at = fake.date_time_this_year()  # '2006-04-30T03:01:38'
    grocery = Grocery(name, place, price, quantity, bought_at)
    db.session.add(grocery)
    db.session.commit()


# Serialize the query set
# API
# Parser for grocery
parser = reqparse.RequestParser()
parser.add_argument('name')
parser.add_argument('price')
parser.add_argument('quantity')
parser.add_argument('bought_at')
parser.add_argument('place')


# Grocery
# Show a single grocery item and lets you delete a grocery item
class GroceryAPI(Resource):
    def find_by_id(self, id):
        return Grocery.query.filter(Grocery.id == id).first()

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
class GroceryListAPI(Resource):
    def get(self):
        gm = Grocery
        gmBoughtAt = gm.bought_at.desc()
        gmCreateAt = gm.created_at.desc()
        groceries = gm.query.order_by(gmBoughtAt, gmCreateAt).all()
        # Serialize the query set
        result = groceries_schema.dump(groceries)
        return jsonify({'data': result.data})

    def post(self):
        data = parser.parse_args()
        bought_at = datetime.strptime(data["bought_at"], "%Y-%m-%d")
        grocery = Grocery(data["name"], data["place"], data["price"],
                          data["quantity"], bought_at)
        db.session.add(grocery)
        db.session.commit()
        return data, 201


# Setting API
api.add_resource(GroceryListAPI, '/api/groceries', '/api/groceries/')
api.add_resource(GroceryAPI, '/api/groceries/<int:grocery_id>')


# asset compile
assets = Environment(app)

bundles = {
    'css_min': Bundle(
        'libs/bootstrap/css/bootstrap.min.css',
        'libs/bootstrap-datepicker/css/bootstrap-datepicker.css',
        'libs/fontawesome/css/font-awesome.css',
        'libs/select2/css/select2.css',
        'css/style.css',
        output='css_min.css', filters='cssmin'),

    'js_min': Bundle(
        'libs/angular/angular.js',
        'libs/angular/angular-animate.js',
        'libs/angular/angular-resource.js',
        'libs/angular/angular-route.js',
        'libs/jquery/jquery.js',
        'libs/moment/moment.js',
        'libs/bootstrap/js/bootstrap.js',
        'libs/bootstrap-datepicker/js/bootstrap-datepicker.js',
        'libs/select2/js/select2.js',
        'js/app.js',
        output='js_min.js', filters='jsmin')
}

assets.register(bundles)


# Routes
@app.route('/')
def index():
    return render_template("index.html")
    # return app.send_static_file("index.html")



if __name__ == "__main__":
    app.run(debug=True)
