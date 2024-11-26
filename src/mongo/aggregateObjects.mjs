export const titlesWithRatingHigherThenAvarege = [
    {
      '$facet': {
        'comedies2010': [
          {
            '$match': {
              '$and': [
                {
                  'year': 2010
                }, {
                  'genres': 'Comedy'
                }
              ]
            }
          }, {
            '$project': {
              '_id': 0, 
              'title': 1, 
              'rating': '$imdb.rating'
            }
          }
        ], 
        'avg': [
          {
            '$group': {
              '_id': null, 
              'avg': {
                '$avg': '$imdb.rating'
              }
            }
          }, {
            '$project': {
              '_id': 0
            }
          }
        ]
      }
    }, {
      '$unwind': {
        'path': '$comedies2010'
      }
    }, {
      '$replaceRoot': {
        'newRoot': {
          '$mergeObjects': [
            '$$ROOT', {
              '$arrayElemAt': [
                '$avg', 0
              ]
            }
          ]
        }
      }
    }, {
      '$match': {
        '$expr': {
          '$gt': [
            '$comedies2010.rating', '$avg'
          ]
        }
      }
    }, {
      '$project': {
        'title': '$comedies2010.title'
      }
    }
  ];
  export const commentWithMovieTitle = [
  {
    '$lookup': {
      'from': 'movies', 
      'localField': 'movie_id', 
      'foreignField': '_id', 
      'as': 'movieid'
    }
  }, {
    '$match': {
      'movieid': {
        '$size': 1
      }
    }
  }, {
    '$limit': 5
  }, {
    '$replaceRoot': {
      'newRoot': {
        '$mergeObjects': [
          {
            'title': {
              '$getField': {
                'field': 'title', 
                'input': {
                  '$first': '$movieid'
                }
              }
            }
          }, '$$ROOT'
        ]
      }
    }
  }, {
    '$project': {
      'movieid': 0, 
      'movie_id': 0
    }
  }
];