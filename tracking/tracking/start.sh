#!/bin/bash

export FLASK_APP=tracking
export FLASK_ENV=development

host=0.0.0.0
port=5000

flask run -h $host -p $port --no-reload
