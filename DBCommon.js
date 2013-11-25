/**
 * DBCommon 提供基本的数据库创建,表创建,表增删改查,批量增删改查操作
 * 1,数据库创建(同步方式,注意判断浏览器是否支持,数据库是否创建成功)
 * 2,表的创建,公共方法,输入参数包括表名称,字段名称 注意回调函数
 * 3,数据增加,公共方法,输入参数包括表名称,各个字段名 
 * 4,数据修改,公共方法,输入参数包括表名称,修改字段值,条件
 * 5,数据删除,公共方法,输入参数包括表名称,条件 
 * 6,表删除,公共方法,输入参数包括表名称
 * 7,表查询,公共方法,输入参数包括表名称,查询条件,结果转换
 * 
 */
/**
 * DBCommon 构造函数,创建数据库
 * 
 * @param dbName 数据库名称
 * @param version 数据库版本号
 * @param displayName 数据库描述
 * @param maxSize 数据库最大容量,没有不填
 * @param debug 是否开题日志记录
 */
function DBCommon(dbName, version, displayName, maxSize,debug) {
         this.debug = debug;
         try {  
            if (!window.openDatabase) {  
                alert('This browser does not support local database!');  
            } else {  
            if(maxSize){
               this.db = openDatabase(dbName, version, displayName, maxSize);
            }else{
               this.db = openDatabase(dbName, version, displayName);
            }
            }  
        } catch(e) {
            alert('Create local database fail!'); 
        }
}

DBCommon.prototype = {
 log : function( msg ){
        if( this.debug) {
                console.log.apply(console, arguments);
            }
        },

sqlerrorHandler :  function(tx, e) {
       console.log.error(e.message);
    },

getConnection : function (dbName, version, displayName, maxSize) {
	 var dbase;
	 try {  
	    if (!window.openDatabase) {  
	        alert('This browser does not support local database!');  
	    } else {  
		    if(maxSize){
		       dbase = openDatabase(dbName, version, displayName, maxSize);
		    }else{
		       dbase = openDatabase(dbName, version, displayName);
		    }
	    }
	} catch(e) {
	    alert('Create local database fail!'); 
	}
	return dbase;
},
/**
 * 创建表
 * 
 * @param tableName 表名称
 * @param fields 字段数组
 */
createTable : function (tableName, fields, callBack) {
       
       var sql = "CREATE TABLE IF NOT EXISTS " + tableName + " (" + fields.join(",") + ")";
        this.db.transaction(function (tx) {
             tx.executeSql(sql, [], function () {
                if (callBack) callBack();
            }, this.sqlerrorHandler);
        })
        log(sql);
        return this;
    },
/**
 * 删除表
 * 
 * @param tableName 表名称
 */
dropTable : function (tableName) {
        var sql = "DROP TABLE " + tableName;
         this.db.transaction(function (tx) {
            tx.executeSql(sql);
         })
          log(sql);
         return this;
 },
 /**
  * 添加数据
  * 
  * @param tableName 表名称
  * @param fields 字段名称数组
  * @param values 字段值数组
  * @param callback 回调函数
  */
    insert :  function (tableName, fields, values, callback) {
     var sql = "INSERT INTO " + tableName + " (" + fields.join(",") + ") VALUES("
         + new Array(fields.length + 1).join(",?").substr(1) + ")";
         this.db.transaction(function (tx) {
             tx.executeSql(sql, values, function (tx , rs) {if (callback) callback(tx , rs);} , this.sqlerrorHandler);
        });
        log(sql+values);
         return this;
     },
/**
 * 删除记录
 * @param tableName 表名称
 * @param pkField 字段名称
 * @param value 字段值
 * @param callback 
 * @return
 */     
deleteRow : function (tableName, pkField, value, callback){
      var sql = "DELETE FROM " + tableName + " WHERE " + pkField + " = ?";
         this.db.transaction(function (tx) {
             tx.executeSql(sql, [value], null, this.sqlerrorHandler);
              if (callback) callback();  
         })
         log(sql+value);
         return this;
     },
     
/**
 * 删除所有记录
 * @param tableName 表名称
 * @param pkField 字段名称
 * @param value 字段值
 * @param callback 
 * @return
 */     
delete : function (tableName, callback){
      var sql = "DELETE FROM " + tableName;
         this.db.transaction(function (tx) {
             tx.executeSql(sql, null, null, this.sqlerrorHandler);
              if (callback) callback();  
         })
         log(sql);
         return this;
     },

/**
 * 更新记录(字段名称数组中第一个字段填主键名称，所对应的values的第一个值填主键的值)
 * @param tableName 表名
 * @param fields 字段名称数组
 * @param values 字段值数组
 * @param callback
 * @return
 */
update :  function (tableName, fields, values,callback) {
        var len = fields.length;

        var sql = "";
        for (i = 1; i < len; i++) {
           if (i == 1) sql += fields[i] + " = '" + values[i] + "'";
            else sql += "," + fields[i] + " = '" + values[i] + "'";
        }
         sql = 'UPDATE ' + tableName + ' SET ' + sql + ' where ' + fields[0] + '= ?';
 
        this.db.transaction(function (tx) {
             tx.executeSql(sql, [values[0]],
             null, this.sqlerrorHandler);
             if (callback) callback();
         });
         log(sql+values[0]);
        return this ;
     },
/**
 * 查询单行数据,在回调函数中处理返回数据
 * @param tableName 表名
 * @param pkField 字段名
 * @param value 字段值
 * @param callback
 * @return
 */
queryById :  function (tableName, pkField, value, callback) {
     var sql = 'SELECT * FROM ' + tableName + ' WHERE '+pkField + '= ?'
       this.db.transaction(function (tx) {
            tx.executeSql(sql, [value], function (tx, result) {
                 if (callback) 
                 {
                     var rows = result.rows;
                     if (rows.length != 0) {
                       callback(result.rows.item(0)); 
                     }else{
                        callback(null);
                     }
                 }
             }, this.sqlerrorHandler);
        });
        log(sql+value);
        return this ;
    },

/**
 * 查询整张表数据
 * @param tableName 表名
 * @param callback
 * @return
 */
queryAll :  function (tableName, callback) {
     var sql = 'SELECT * from ' + tableName;
         this.db.transaction(function (tx) {
             tx.executeSql(sql, [], function (tx, result) {
                 if (callback) callback(result);                
             }, this.sqlerrorHandler);
        });
       log(sql);
        return this ;
    },

/**
 * 根据条件查询数据
 * @param tableName 表名
 * @param queryConditions 查询条件
 * @param callback
 * @return
 */
query :  function (tableName, queryConditions, callback) {
     var sql = 'SELECT * from ' + tableName+" WHERE "+ queryConditions
        this.db.transaction(function (tx) {
            tx.executeSql(sql, [], function (tx, result) {
               if (callback) callback(result);              
            }, this.sqlerrorHandler);
        }); 
        log(sql);
         return this;
    },


/**
 * 根据条件最大值
 * @param tableName 表名
 * @param queryConditions 查询条件
 * @param callback
 * @return
 */
queryMaxId :  function (tableName, callback) {
     var sql = 'SELECT MAX(ID) id from ' + tableName;
        this.db.transaction(function (tx) {
            tx.executeSql(sql, [], function (tx, result) {
               if (callback) callback(result);              
            }, this.sqlerrorHandler);
        }); 
        log(sql);
         return this;
    }
}



