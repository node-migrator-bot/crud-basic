module.exports = function (env) {
   var 
   util = require('util'),
   self = {};

   var cradle = require('cradle');
   var db = new(cradle.Connection)(env.host, env.port).database(env.db);
   
   self.entity = function() {
      return 'document';
   };

   self.open = function(callback) {
      callback();
   };
   
   self.dbName = function() {
      return db.name;
   };
   
   self.collection = function(collectionName, options, callback) {
      return db.collection(collectionName, options, callback)
   };
   
   self.createCollection = function(collectionName, callback) {
      db.save(collectionName, callback);
   };
   
   self.deleteCollection = function(collectionName, callback) {
      db.collection(collectionName, function(err, collection) {
         collection.drop(function(err) {
            callback(err)
         })
      })
   };   

   self.entityNames = function(collectionName, callback) {
      return db.collectionNames(collectionName, callback)
   };
   
   self.entityShortNames = function(callback) {
      var nameList = [], re = new RegExp("^" + db.databaseName + ".");
      db.collectionNames(function(err, names) {
         names.forEach(function(element) {
            nameList.push(element.name.replace(re, ""));
         });
         callback(nameList)
      });      
   };

   self.databaseInfo = function(callback) {
      var data = {};
      data.dbName = db.name;
      data.entity = self.entity();
      data.entityNames = [];
      db.all(function(err, res){
         res.forEach(function(row1,row2) {
            db.get(row1, function (err, doc) {
               if (doc.key) data.entityNames.push(doc.key)
               else 
                  if (doc.name) data.entityNames.push(doc.name)
               else 
                  data.entityNames.push(doc.id);
            })
         });
         callback(data)
      })
   };
   
   self.collectionsInfo = function(callback) {
      db.collectionsInfo(function(err, cursor) {
         cursor.toArray(function(err, items) {
            callback(items);
         });
      })   
   };

   self.collectionInfo = function(collectionName, callback) {
      db.collectionsInfo(collectionName, function(err, cursor) {
         cursor.toArray(function(err, items) {
            callback(items);        
         });
      })
   };

   self.list = function(collectionName, callback) {
      db.collection(collectionName, function(err, collection) {
         if (err) {
            console.log("!!!!!!!!! db is ...." + util.inspect(db));
            console.log("!!!!!!!!! err is ...." + util.inspect(err));
            console.log("!!!!!!!!! db state is ...." + util.inspect(db.state));
            callback(err, false);
         }
         else {
            collection.find().toArray(function(err, docs) {
               callback(err, docs);
            });
         }
      })
   };

   self.find = function(collectionName, selector, callback) {
      db.collection(collectionName, function(err, collection) {
         if (err) {
            callback(err);
         }
         else {
            collection.find(selector, function(err, cursor) {
               cursor.nextObject(function(err, doc) {            
                  callback(err, doc);
               });
            });
         }
      })
   };

   self.add = function(collectionName, postData, callback) {
      db.save(collectionName, postData, callback);
   };

   self.update = function(collectionName, selector, postData, callback) {
      db.collection(collectionName, function(err, collection) {
         if (err) {
            callback(err);
         }
         else {
            collection.findAndModify(selector, [], {
               $set: postData
            }, {}, function(err, object) {
               if (err) callback(err)
               else callback(err, object);
            });
         }
      })
   };

   self.remove = function(id, callback) {
      db.remove(id, callback)
   };

   self.renameCollection = function(fromCollection, toCollection, callback) {
      return db.renameCollection(unescape(fromCollection), unescape(toCollection), callback)
   };
   
   return self;
}