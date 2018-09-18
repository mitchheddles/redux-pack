var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _uuid=require('uuid');var _uuid2=_interopRequireDefault(_uuid);
var _trashable=require('trashable');var _trashable2=_interopRequireDefault(_trashable);
var _constants=require('./constants');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}

function isPromise(obj){
return!!obj&&typeof obj.then==='function';
}

function handleEventHook(meta,hook){
if(meta&&meta[hook]&&typeof meta[hook]==='function'){


try{for(var _len=arguments.length,args=Array(_len>2?_len-2:0),_key=2;_key<_len;_key++){args[_key-2]=arguments[_key];}
meta[hook].apply(meta,args);
}catch(e){
console.error(e);
}
}
}

function handlePromise(dispatch,getState,action){var _extends2;var
cancelable=action.cancelable,promise=action.promise,type=action.type,payload=action.payload,meta=action.meta;



var transactionId=_uuid2.default.v4();
var startPayload=payload;

dispatch({
type:type,
payload:payload,
meta:_extends({},
meta,(_extends2={},_defineProperty(_extends2,
_constants.KEY.LIFECYCLE,_constants.LIFECYCLE.START),_defineProperty(_extends2,
_constants.KEY.TRANSACTION,transactionId),_extends2))});


handleEventHook(meta,'onStart',payload,getState);

var success=function success(data){var _extends3;
dispatch({
type:type,
payload:data,
meta:_extends({},
meta,(_extends3={
startPayload:startPayload},_defineProperty(_extends3,
_constants.KEY.LIFECYCLE,_constants.LIFECYCLE.SUCCESS),_defineProperty(_extends3,
_constants.KEY.TRANSACTION,transactionId),_extends3))});


handleEventHook(meta,'onSuccess',data,getState);
handleEventHook(meta,'onFinish',true,getState);
return{payload:data};
};

var _cancel=function _cancel(){var _extends4;
dispatch({
type:type,
payload:null,
meta:_extends({},
meta,(_extends4={
startPayload:startPayload},_defineProperty(_extends4,
_constants.KEY.LIFECYCLE,_constants.LIFECYCLE.CANCEL),_defineProperty(_extends4,
_constants.KEY.TRANSACTION,transactionId),_extends4))});


handleEventHook(meta,'onCancel',false,getState);
handleEventHook(meta,'onFinish',false,getState);
};

var failure=function failure(error){var _extends5;
dispatch({
type:type,
payload:error,
error:true,
meta:_extends({},
meta,(_extends5={
startPayload:startPayload},_defineProperty(_extends5,
_constants.KEY.LIFECYCLE,_constants.LIFECYCLE.FAILURE),_defineProperty(_extends5,
_constants.KEY.TRANSACTION,transactionId),_extends5))});


handleEventHook(meta,'onFailure',error,getState);
handleEventHook(meta,'onFinish',false,getState);
return{error:true,payload:error};
};

if(cancelable){
var cancelablePromise=(0,_trashable2.default)(promise);
return{
promise:cancelablePromise.then(success,failure),
cancel:function cancel(){
if(cancelablePromise){

cancelablePromise.trash();

cancelablePromise=null;
}

_cancel();
}};

}






return promise.then(success,failure);
}

var middleware=function middleware(store){return function(next){return function(action){


if(action==null){
return null;
}



if(isPromise(action.promise)){
return handlePromise(store.dispatch,store.getState,action);
}


return next(action);
};};};


module.exports=middleware;