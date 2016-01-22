/**
 * Database 관련 유틸리티 
 * 
 */

/**
 * select count Query
 */
var selectCountQuery=function(){
	selectQuery("count");
}

/**
 * select 필드명 Query
 */
var selectNameQuery=function(){
	selectQuery("name");
}

/**
 * select * Query
 */
var selectAllQuery=function(){
	selectQuery("*");
}

/**
 * select Query
 */
var selectQuery=function(mode){
	if(null==tableName){
		webix.message({ type:"error", text:"테이블을 먼저 선택해주세요"});
		return;
	}

	var columnList=null;
	var whereList=null;

	var html='select ';
	switch(mode){
		case 'count':// count query 	
			columnList=getColumns('columnList');
			// PK 를 구한다.
			var pk="*";
			if(columnList.length>0){
				pk=columnList[0];
			}
			html+='\r\tcount('+pk+')';		
			break;
		case 'name'	://select query	
			columnList=getColumns('selectList');
			html+=columnList.join(",\r\t");	
			break;
		case '*'	://select all query	
			html+='\r\t*';					
			break;
	}

	html+='\rfrom ';
	html+=tableName;
	
	whereList=getColumns('selectWhereList');
	if(whereList.length>0){
		html+='\rwhere \r\t' + whereList.join("\r\tand ");
	}
	
	// database 종류에 따라 한정자를 넣는다. (count 가 아닌 경우에만)
	if(mode!='count'){
		switch (driver) {
		case 'mysql'	: 	html+=' limit 10';									break;
		case 'oracle'	: 	html='select * from (\r'+html+'\r) where rownum <= 10';	break;
		}
	}
	
//	html+= ';'; 		
	$$("database_query_input").setValue(html);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus();
};

/**
 * delete Query
 */
var deleteQuery=function(){
	if(null==tableName){
		webix.message({ type:"error", text:"테이블을 먼저 선택해주세요"});
		return;
	}

	var html='delete from '+tableName;
	var whereList=getColumns('whereList');

	if(whereList.length>0){
		html+='\rwhere \r\t' + whereList.join("\r\tand ");
	}
	// database 종류에 따라 한정자를 넣는다.
	switch (driver) {
		case 'mysql':html+=' limit 10';break;
	}
	
//	html+= ';'; 		
	$$("database_query_input").setValue(html);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
};

/**
 * insert into query
 */
var insertIntoQuery=function(){
	if(null==tableName){
		webix.message({ type:"error", text:"테이블을 먼저 선택해주세요"});
		return;
	}

	var columnList=getColumns('selectList');
	var intoList=getColumns('selectIntoList');
	var html='INSERT INTO '+tableName;
	
	html+='\r(';
	html+=columnList.join(",");
	html+=')\rVALUES(';
	html+=intoList.join(",");
	html+=')';

	$$("database_query_input").setValue(html);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
};

/**
 * insert set query
 */
var insertSetQuery=function(){
	if(null==tableName){
		webix.message({ type:"error", text:"테이블을 먼저 선택해주세요"});
		return;
	}

	// database 종류에 따라 지원하지 않는다.
	if(driver == 'oracle'){
		insertIntoQuery();
	} else {
		var setList=getColumns('selectSetList');
		var html='INSERT INTO '+tableName;
		html+='\rSET\r\t';
		html+=setList.join("\r\t,");

		$$("database_query_input").setValue(html);
		// 에디터 창으로 focus 를 되돌린다.
		$$("database_query_input").focus(); 
	}
};

/**
 * update Query
 */
var updateSetQuery=function(){
	if(null==tableName){
		webix.message({ type:"error", text:"테이블을 먼저 선택해주세요"});
		return;
	}

	var setList=getColumns('selectSetList');
	var whereList=getColumns('whereList');
	
	var html='UPDATE '+tableName;
	html+='\rSET\r\t';
	html+=setList.join("\r\t,");
	if(whereList.length>0){
		html+='\rwhere \r\t' + whereList.join("\r\tand ");
	} else {
		webix.alert("update query 에 where 가 없습니다.<br/>진행하시려면 확인을 눌러주세요");
	}
	
	// database 종류에 따라 한정자를 넣는다.
	switch (driver) {
		case 'mysql':html+=' limit 10';break;
	}
	$$("database_query_input").setValue(html);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
}

/**
 * 테이블에서 mode 에 따라 컬럼 데이터를 획득한다.
 */
var getColumns = function (mode){
	if(null==tableName){
		webix.message({ type:"error", text:"테이블을 먼저 선택해주세요"});
		return;
	}
	
  	var list= new Array();
  	var listLength = $$("table_info_develop_list").data.order.length;
  	var loop = 0;
  	$.each($$("table_info_develop_list").data.pull,function(index){
		switch(mode){
		case 'columnList':	// 전체 컬럼 조회
			list.push(this.columnName);
			break;
		case 'selectList':	// 체크박스에 선택된 컬럼 조회
			if(this.field_checkbox == 1){
				list.push(this.columnName);
			}
			break;
		case 'selectWithComment':
			var html=aliasTable(tableName).toUpperCase();
			html+=".";
			html+=this.columnName;
			html+=" AS ";
			html+=aliasTable(tableName).toUpperCase();
			html+="_";
			html+=this.columnName; 
			html+= (listLength -1 > loop) ? ",":"";
			html+=" \t\t /*";
			html+= this.comment != null ? this.comment.replace("\n"," ") : ""; 
			html+= "*/";
			list.push(html);
			break;
		case 'selectIntoList':	// 체크박스에 선택된 set 값 into 스타일 조회
			if(this.field_checkbox == 1){
				if(this.field_set==""){ // 값이 없는 경우 prepare 스타일로
					list.push(prepareStyleConverter(this.dataType,this.columnName));					
				} else {
					list.push(columnTypeConverter(null,this.dataType,this.field_set));					
				}
			}
			break;
		case 'selectSetList':
			if(this.field_checkbox == 1){
				if(this.field_set==""){ // 값이 없는 경우 prepare 스타일로
					list.push(this.columnName + '=' + prepareStyleConverter(this.dataType,this.columnName));					
				} else {
					list.push(this.columnName + columnTypeConverter(this.field_operation,this.dataType,this.field_set));					
				}
			}
			break;
		case 'selectWhereList':	// 체크박스에 선택되고 where 에 값이 있는 것만..
			if(this.field_checkbox == 1){
				if(this.field_where != ""){
					list.push(this.columnName + columnTypeConverter(this.field_operation,this.dataType,this.field_where));
				}
			}
			break;
		case 'whereList':	// 체크박스에 선택되고 값이 없으면 prepare 스타일로..
			if(this.field_checkbox == 1){
				if(this.field_where != ""){
					list.push(this.columnName + columnTypeConverter(this.field_operation,this.dataType,this.field_where));
				} else {
					list.push(this.columnName + this.field_operation +  prepareStyleConverter(this.dataType,this.columnName));
				}
			}
			break;
		case 'commentList':
			if(this.field_checkbox == 1){
				list.push(this.comment != null ? this.comment.replace("\n"," ") : "");
			}
			break;
		case 'dataTypeList':
			if(this.field_checkbox == 1){
				list.push(this.dataType);
			}
			break;
		case 'nullAbleList':
			if(this.field_checkbox == 1){
				list.push(this.nullable);
			}
			break;
		case 'columnKeyList':
			if(this.field_checkbox == 1){
				list.push(this.columnKey);
			}
			break;
		case 'extraList':
			if(this.field_checkbox == 1){
				list.push(this.extra);
			}
			break;
		}
		loop++;
	});
	return list;
};


/**
 * 필드의 데이터 타입을 문자/숫자/기타로 분류 한다.
 */
var columnTypeConverter=function(operation,type,value){
  	var quate="";
  	var operationValue="";
  	
  	// quate 를 붙이지 않는 타입
  	var isNotQuate = false;
  	isNotQuate=isNotQuate || type.toUpperCase().indexOf("NUMBER")>=0;		// 숫자인 경우
  	isNotQuate=isNotQuate || type.toUpperCase().indexOf("INT")>=0			// 숫자인 경우
  	isNotQuate=isNotQuate || type.toUpperCase().indexOf("INTERGER")>=0		// 숫자인 경우
  	isNotQuate=isNotQuate || type.toUpperCase().indexOf("DATE")>=0			// 날짜 형식인 경우
  	isNotQuate=isNotQuate || type.toUpperCase().indexOf("TIME")>=0			// 날짜 형식인 경우
  	
  	if(isNotQuate==false)	quate="'";
  	
  	
	// database 종류에 따라 날짜 관련 설정을 한다.
  	if(value!=null && type.toUpperCase().indexOf("DATE")>=0 ){
  		switch (driver) {
		case 'oracle':
			//날짜에 0 이 들어가 있으면 잘라 낸다.
			if(value.indexOf(".") >=0){
				value = value.substring(0, value.indexOf("."));
			}
			value="to_date('"+value+"' , 'yyyy-mm-dd hh24:mi:ss')";		
			break;
  		}
  	} else if(type.toUpperCase().indexOf("TIME")>=0){
  		// TODO time 에 대한 처리는 좀더 지켜본다.
  	}
  	
  	if(value==null || value.toUpperCase()=="NULL"){
  		console.log(operationValue);
  		if(operation==null){
  			operationValue = "null";
  		} else {
  			operationValue = " is null ";	
  		}
  		
  	} else {
  	  	switch (operation) {
	  	case '=': 		operationValue= " = " + quate + value + quate + ' '; 	break;
	  	case '>=': 		operationValue= " >= " + quate + value + quate + ' ';  	break; 
	  	case '<=': 		operationValue= " <= " + quate + value + quate + ' ';	break;
	  	case '%like':	operationValue= " like '%" + value + "' ";		 		break;
	  	case 'like%':	operationValue= " like '" + value + "%' ";		 		break;
	  	case '%like%':	operationValue= " like '%" + value + "%' ";		 		break;
	  	case 'IN()':	operationValue= " IN (" + value + ") ";			 		break;
	  	default : 		operationValue= quate + value + quate;					break;
  	  	}
  		
  	}
  	return operationValue;
};

/**
 * DB 타입에 매치되는 JAVA 타입을 검색한다.
 */
var columnJavaTypeSearch=function(columnTypeFull){
	// datatype
	var dataType="";
	
	// MYSQL 
	if(columnTypeFull.indexOf('float')>=0){
		dataType='Float';
	}
	else if(columnTypeFull.indexOf('tinyint')>=0){
		dataType='Integer';
	}
	else if(columnTypeFull.indexOf('smallint')>=0){
		dataType='Integer';
	}
	else if(columnTypeFull.indexOf('int')>=0){
		if(columnTypeFull.indexOf('unsigned')>=0){
			dataType='Long';
		}
		else{
			dataType='Integer';
		}
	}
	else if(columnTypeFull.indexOf('varchar')>=0 
			|| columnTypeFull.indexOf('char')>=0 
			|| columnTypeFull.indexOf('text')>=0 
			|| columnTypeFull.indexOf('enum')>=0 ){
		dataType='String';
	}
	else if(columnTypeFull.indexOf('datetime')>=0){
		dataType='Timestamp';
	}
	else if(columnTypeFull.indexOf('date')>=0){
		dataType='Date';
	}
	else if(columnTypeFull.indexOf('time')>=0){
		dataType='Time';
	}
	// MYSQL END
	
	// ORACLE 
	if(columnTypeFull.indexOf('NUMBER')>=0){
		dataType='Integer';
	}
	else if(columnTypeFull.indexOf('DATE')>=0){
		dataType='Date';
	}
	else if(columnTypeFull.indexOf('VARCHAR2')>=0 
			|| columnTypeFull.indexOf('CHAR')>=0 
			|| columnTypeFull.indexOf('CLOB')>=0 
			|| columnTypeFull.indexOf('enum')>=0 ){
		dataType='String';
	}
	// ORACLE END
		
	return dataType;
};

/**
 * prepare 스타일에 정의되어 있는 양식으로 필드명을 변경 한다.
 * TODO data type 처리는 차후에 잔행 한다. 
 */
var prepareStyleConverter = function(dataType,columnName){
	var prepareStyle = $$("database_developer_combo_prepare_style").getValue();
	return prepareStyle.replace("field",columnStyleConverter(columnName));
}

/**
 * 테이블 명칭을 java 모델에 맞게 변경한다.
 */
var tableStyleConverter=function(table){
  	var className="";
  	// 컬럼 명칭을 변경하기 위한 처리
  	if(table.indexOf('_')>=0){
  		var names = table.split('_');
  		for(var i=0;i<names.length;i++){
  			className+=names[i].substring(0,1).toUpperCase()+names[i].substring(1, names[i].length).toLowerCase();	
  		}
  	} else {
  		className+=table.substring(0,1).toUpperCase()+table.substring(1, table.length).toLowerCase();
  	}
  	
  	return className;
};

/**
 * DB 필드를 java Model 에 맞게 변경 한다.
 */
var columnStyleConverter=function(column){
	var columnName="";
	
	// 컬럼 명칭을 변경하기 위한 처리
	var postFix = "";
	if(column.indexOf('_')>=0){
		var names = column.split('_');
		
		for(var i=0;i<names.length;i++){
			if(i==0 && names[i].length==1){
				if(names[i].toLowerCase() == 'i'){
					postFix="Number";
				} else if(names[i].toLowerCase() == 'd'){
					postFix="Date";
				}					
			} else{
				if(columnName==""){
					columnName+=names[i].toLowerCase();					
				}
				else{
					columnName+=names[i].substring(0,1)+names[i].substring(1, names[i].length).toLowerCase();	
				}
			}
		}
	} else {
		columnName=column.toLowerCase();
	}
	
	return columnName+postFix;
};

/**
 * 테이블 명을 이용해서 Alias 를 생성한다.
 */
var aliasTable=function(table){
  	var underbar = /_/g;
  	var regAlphabetCapital = /[a-z]/g;
  	var aliase="";
  	// 테이블 명칭에 underVar 가 존재하면
  	if(underbar.test(table)){
  		var tmp=table.split("_");
  		var tmpalias="";
  		for(var i=0;i<tmp.length;i++){
  			if(tmp[i] != null)
  				tmpalias+=tmp[i].substring(0,1).toLowerCase();
  		}
  		aliase=tmpalias;
  	} else if(table.replace(regAlphabetCapital,"").toLowerCase() != ""){
  		aliase=table.replace(regAlphabetCapital,"").toLowerCase();
  	} else{
  		if(table.substring(0,1).toLowerCase()!='t'){
  			aliase=table.substring(0,1);
  		} else{
  			aliase=table.substring(1,2);
  		}
  	}
  
  	return aliase;
};


var javaModel=function(){
	if(null==tableName){
		webix.message({ type:"error", text:"테이블을 먼저 선택해주세요"});
		return;
	}

	// 컬럼명칭
	var columnList=getColumns('columnList');
	// 코멘트
	var columnCommentList=getColumns('commentList');
	// 데이터 타입
	var columnTypeFullList=getColumns('dataTypeList');
	
	var getterSetters="";
	
	var html='\n/**\n\r* Table Name '+tableName+'\n\r*/\n\r';
		html+='public class '+ tableStyleConverter(tableName) + " { \n";

		for(var i=0;i<columnList.length;i++){
  				var column=columnStyleConverter(columnList[i]);
  				var columnComment=columnCommentList[i];
  				var dataType=columnJavaTypeSearch(columnTypeFullList[i]);
  
  		html+='\n\t/**\n\t* column name : '+ columnList[i] +'\n\t* '+columnComment+'\n\t*/';
		html+='\n\tprivate '+dataType+ ' ' + column +';\n';
  
  				// getset
		columnGetSet=column.substring(0,1).toUpperCase()+column.substring(1, column.length);
		getterSetters+='\n\t/**\n\t* column name : '+ columnList[i] +' \n\t* '+columnComment+' setter \n\t*/';
		getterSetters+='\n\tpublic void set'+columnGetSet+'('+dataType+' '+column+'){\n\t\tthis.'+column+' = '+column+';\n\t}';
		getterSetters+='\n\t/**\n\t* column name : '+ columnList[i] +' \n\t* '+columnComment+' getter \n\t*/';
		getterSetters+='\n\tpublic '+dataType+' get'+columnGetSet+'(){\n\t\treturn this.'+column+';\n\t}';
	}
	html+=getterSetters;
	html+="\n} ";

	
	$$("database_query_input").setValue(html);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
  };
  
  
var javaHibernateModel=function(){
	if(null==tableName){
		webix.message({ type:"error", text:"테이블을 먼저 선택해주세요"});
		return;
	}

	// 컬럼명칭
	var columnList=getColumns('columnList');
	// 코멘트
	var columnCommentList=getColumns('commentList');
	// 데이터 타입
	var columnTypeFullList=getColumns('dataTypeList');
	// null 필드 여부
	var columnIsNullAbleList=getColumns('nullAbleList');
	// pk 여부
	var columnPKList=getColumns('columnKeyList');
	// AI 여부
	var columnAIList=getColumns('extraList');

	// 테이블 네임을 변경하기 때문에 치환 한다.
	var tableNameAlias=tableName;
	
	var tableAnnotation ='@Entity'+"\n";
	tableAnnotation +='@Table(name = "'+tableNameAlias+'")'+"\n";
	tableAnnotation +='@org.hibernate.annotations.Table(comment = "'+ tableComment +'", appliesTo = "'+tableNameAlias+'")'+"\n";
	
	if(tableNameAlias.indexOf('t')==0){
		tableNameAlias=tableNameAlias.substring(1, tableNameAlias.length);
	}
	
	var html=tableAnnotation+'public class '+ tableStyleConverter(tableNameAlias) +"{ \n";
	// 기본 생성자
	var constructBase ='\n\t/**\n\t* 기본 생성자 \n\t*/'+'\n\tpublic '+tableNameAlias +'(){}';
  
  			// 전체 생성자
	// setter 생성자 코멘트
	var constructSetterComment= '\n\t/**\n\t* Setter 전체 생성자';
	// setter 생성자 
	var constructSetterBody= '\n\tpublic '+tableNameAlias +'(';
	// setter 생성자 파라메터
	var constructSetterParamsList = new Array();
	// setter 생성자 바디			
  	var constructSetterBodyList = new Array();
  
  	// 필수값 생성자
	// setter 생성자 코멘트
	var constructSetterRequireComment= '\n\t/**\n\t* Setter 필수값 생성자';
	// setter 생성자 
	var constructSetterRequireBody= '\n\tpublic '+tableNameAlias +'(';
	// setter 생성자 파라메터
	var constructSetterRequireParamsList = new Array();
	// setter 생성자 바디			
	var constructSetterRequireBodyList = new Array();
	
	// getter/setter
	var getterSetters="";
	
	var constructIndex=0;
	var constructRequireIndex=0;
	for(var i=0;i<columnList.length;i++){
		var column=columnStyleConverter(columnList[i]);
		var columnComment=columnCommentList[i];
		var dataType=columnJavaTypeSearch(columnTypeFullList[i]);
		var printNullAble = 'nullable=true';
		if(columnIsNullAbleList[i] == 'NO')
			printNullAble = 'nullable=false';
  
  		// construct require
		// construct All
		if(!(columnPKList[i] == 'PK' || columnPKList[i] == 'PRI')){ // pk 가 아닌 경우에만 생성한다.
			constructSetterComment+='\n\t* @param '+column;
			constructSetterParamsList[constructIndex]=dataType + ' ' + column; 
			constructSetterBodyList[constructIndex]	='this.'+column+'='+column+';';
			constructIndex++;
			
			// 필수값 생성자
			if(columnIsNullAbleList[i]=='NO'){
				constructSetterRequireComment+='\n\t* @param '+column;
				constructSetterRequireParamsList[constructRequireIndex]=dataType + ' ' + column; 
				constructSetterRequireBodyList[constructRequireIndex]	='this.'+column+'='+column+';';
  						constructRequireIndex++;
  					}
  				}
  
  				html+='\n\t/**\n\t* '+columnComment+'\n\t*/';
		if(columnPKList[i] == 'PK' || columnPKList[i] == 'PRI'){ // pk 인 경우에는 ID 를 생성
			html+='\n\t@Id';
		}
		if(columnAIList[i] == 'auto_increment'){
			html+='\n\t@GeneratedValue(strategy = GenerationType.AUTO)';
		}
		
		html+='\n\t@Column(name="' + columnList[i] +'" , columnDefinition="'+columnTypeFullList[i]+' COMMENT \''+columnCommentList[i]+'\'", '+printNullAble+')';
		html+='\n\tprivate '+dataType+ ' ' + column +';\n';
		
		// getset
		columnGetSet=column.substring(0,1).toUpperCase()+column.substring(1, column.length);
		getterSetters+='\n\t/**\n\t* column name : '+ columnList[i] +' \n\t* '+columnComment+' setter '; 
		getterSetters+='\n\t* @param '+column;
		getterSetters+='\n\t*/';
		getterSetters+='\n\tpublic void set'+columnGetSet+'('+dataType+' '+column+'){\n\t\tthis.'+column+' = '+column+';\n\t}';
		getterSetters+='\n\t/**\n\t* column name : '+ columnList[i] +' \n\t* '+columnComment+' getter';
		getterSetters+='\n\t* @return '+dataType;
		getterSetters+='\n\t*/';
		getterSetters+='\n\tpublic '+dataType+' get'+columnGetSet+'(){\n\t\treturn this.'+column+';\n\t}';
  	}
  
  	constructSetterBody+=constructSetterParamsList.join(',')+'){';
	constructSetterBody+='\n\t\t'+constructSetterBodyList.join('\n\t\t');
	constructSetterBody+='\n\t}';
	constructSetterComment+='\n\t*/';
	
	constructSetterRequireBody+=constructSetterRequireParamsList.join(',')+'){';
	constructSetterRequireBody+='\n\t\t'+constructSetterRequireBodyList.join('\n\t\t');
	constructSetterRequireBody+='\n\t}';
	constructSetterRequireComment+='\n\t*/';
	
	html+=constructBase;
	html+=constructSetterRequireComment;
	html+=constructSetterRequireBody;
	html+=constructSetterComment;
	html+=constructSetterBody;
	html+=getterSetters;
	html+="\n} ";

	$$("database_query_input").setValue(html);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
};
  
var javaModelSet=function(){
	if(null==tableName){
		webix.message({ type:"error", text:"테이블을 먼저 선택해주세요"});
		return;
	}

	// 컬럼명칭
	var columnList=getColumns('columnList');
	
	var columnHtml='';
	var columnName='';
	var columnParamName='';
	var tableNameAlias=tableName;

	for(var i=0;i<columnList.length;i++){
		columnParamName=columnStyleConverter(columnList[i]);
		columnName=columnParamName.substring(0,1).toUpperCase()+columnParamName.substring(1, columnParamName.length);
		columnHtml+=tableStyleConverter(tableNameAlias)+'.set'+columnName+'('+columnParamName+');\n';
	}
	$$("database_query_input").setValue(columnHtml);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
};
  
var javaModelGet=function(){
	if(null==tableName){
		webix.message({ type:"error", text:"테이블을 먼저 선택해주세요"});
		return;
	}

	// 컬럼명칭
	var columnList=getColumns('columnList');
	var columnHtml='';
	var columnName='';
	var columnParamName='';
	var tableNameAlias=tableName;
 
	for(var i=0;i<columnList.length;i++){
		columnParamName=columnStyleConverter(columnList[i]);
		columnName=columnParamName.substring(0,1).toUpperCase()+columnParamName.substring(1, columnParamName.length);
		columnHtml+=tableStyleConverter(tableNameAlias)+'.get'+columnName+'();\n';
	}
	
	$$("database_query_input").setValue(columnHtml);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
};


var mybatisSelect = function(){
	if(null==tableName){
		webix.message({ type:"error", text:"테이블을 먼저 선택해주세요"});
		return;
	}
	$$("database_query_input").setValue(getColumns('selectWithComment').join("\n"));
  	var columnHtml ='<sql id="selectBy'+tableStyleConverter(tableName)+'">\n';
  	columnHtml+=$$("database_query_input").getValue();
  	columnHtml+='\n</sql>';	
	$$("database_query_input").setValue(columnHtml);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
};

var mybatisInsert = function(){
	insertIntoQuery();
  	var columnHtml ='<insert parameterType="'+tableStyleConverter(tableName)+'" id="insert'+tableStyleConverter(tableName)+'" statementType="PREPARED">\n';
  	columnHtml+='\n/* insert'+tableStyleConverter(tableName)+' */\n';
  	columnHtml+=$$("database_query_input").getValue();
  	columnHtml+='\n</insert>';
	$$("database_query_input").setValue(columnHtml);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
};

var mybatisUpdate = function(){
  	updateSetQuery();
  	var columnHtml ='<update parameterType="'+tableStyleConverter(tableName)+'" id="update'+tableStyleConverter(tableName)+'" statementType="PREPARED">\n';
  	columnHtml+='\n/* update'+tableStyleConverter(tableName)+' */\n';
  	columnHtml+=$$("database_query_input").getValue();
  	columnHtml+='\n</update>';
	$$("database_query_input").setValue(columnHtml);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
};

var mybatisDelete = function(){
  	deleteQuery();
  	var columnHtml ='<delete parameterType="'+tableStyleConverter(tableName)+'" id="delete'+tableStyleConverter(tableName)+'" statementType="PREPARED">\n';
  	columnHtml+='\n/* delete'+tableStyleConverter(tableName)+' */\n';
  	columnHtml+=$$("database_query_input").getValue();
  	columnHtml+='\n</delete>';
  	$("[name=query]").val(columnHtml);
	$$("database_query_input").setValue(columnHtml);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
};

var mybatisResultMap = function(){
	if(null==tableName){
		webix.message({ type:"error", text:"테이블을 먼저 선택해주세요"});
		return;
	}
	var columnList=getColumns('columnList');
	var columnHtml='';
	var columnName='';
	var columnParamName='';
	var tableNameAlias=tableName;

	columnHtml+='<resultMap type="'+tableStyleConverter(tableName)+'" id="resultBy'+tableStyleConverter(tableName)+'">\n';
  
	for(var i=0;i<columnList.length;i++){
		columnParamName=columnStyleConverter(columnList[i]);
		columnName=columnParamName.substring(0,1).toLowerCase()+columnParamName.substring(1, columnParamName.length);
		columnHtml+='\t<result property="'+columnName+'" column="'+ aliasTable(tableNameAlias).toUpperCase() +"_"+columnList[i]+'" />\n';
	}
	columnHtml+='</resultMap>';

	$$("database_query_input").setValue(columnHtml);
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
};


/**
 * 쿼리 로그 및 즐겨찾는 쿼리 
 */
var database_developer_cell = [{
		id:"database_query_log_view",
		header:"Query Log",
		view : "datatable", 
    	columns:[
			{ 	id:"seq",	header:["Seq", {	// 검색창 구현
				content:"textFilter", placeholder:"sql search",
				compare:function(value, filter, obj){ // 검색창 필터조건 구현
						if (equals(obj.query	, filter)) return true;
						return false;
				}, colspan:5}]
				,width:40
			},
			{ id:"date",		header:"DateTime",	width:95},
			{ id:"query",		header:"Query",		width:150},
			{ 
				id:"reTry",		header:"재사용",		width:60,
				template:'<input type="button" value="사용" style="width:40px;" data="#query#" onClick="reUseQuery(this);"/>',
			},
			{ 
				id:"favorities",	header:"즐겨찾기",		width:70,
				template:'<input type="button" value="저장" style="width:40px;" data="#query#" onClick="addFavorityQueryPopup(this);"/>',
			}
		],
		data:[],
		tooltip:true,
		resizeColumn:true,
	},
	{
		id:"database_query_favorities_view",
		header:"Favorites Query",
		view : "datatable", 
    	columns:[
			{ 	id:"seq",	header:["Seq", {	// 검색창 구현
				content:"textFilter", placeholder:"memo and sql search",
				compare:function(value, filter, obj){ // 검색창 필터조건 구현
						if (equals(obj.memo	, filter)) return true;
						if (equals(obj.query, filter)) return true;
						return false;
				}, colspan:5}]
				,width:40
			},
			{ id:"memo",			header:"Memo",		width:100},
			{ id:"query",			header:"Query",		width:150},
			{ id:"date",			header:"DateTime",	width:80},
			{ 
				id:"reTry",			header:"사용",		width:60,
				template:'<input type="button" value="사용" style="width:40px;" data="#query#" onClick="reUseQuery(this);"/>',
			},
			{ 
				id:"favorities",	header:"삭제",	width:70,
				template:'<input type="button" value="삭제" style="width:40px;" data="#query#" onClick="reUseQuery(this);"/>',
			}
		],
		data:[],
		tooltip:true,
		select:"row",
		resizeColumn:true,
	}
];

// 쿼리 재사용
var reUseQuery=function(obj){
	console.log(obj);
	$$("database_query_input").setValue(obj.getAttribute("data"));
	// 에디터 창으로 focus 를 되돌린다.
	$$("database_query_input").focus(); 
};

// 즐겨찾는 쿼리 폼
var add_favority_query_form = {
	id:" add_favority_query_form",
	view:"form",
	borderless:true,
	elements: [
		{ id:"favority_memo", 	view:"text", label:'memo', 	name:"memo", value:""},
		{ id:"favority_query", 	view:"text", label:'query', name:"query", value:""},
		{margin:5, cols:[
			{ 
				id:"favority_query_button",view:"button", value:"추가" , type:"form", 
				on:{"onItemClick":function(){// 로그인 실행
//					webix.ajax().post("/member/doLogin.json", this.getFormView().getValues(), function(text,data){
//						// 로그인 실패 
//						if(data.json().status !=200){
//							// validate 메세지 
//							var message = data.json().desc.split("\n");
//							webix.message({ type:"error", text:message[0].replace("="," ") });
//						} else { // 로그인 성공
//							// 로그인 성공 액션
//							webix.message("로그인 처리 완료");
//							// 1초 후에 리로드 한다.	
//							window.setTimeout(function(){
//								document.location = document.location.href;	
//							}, 1000)										
//						}
//					});
				}
			}},
			{ view:"button", value:"취소", click:function(){
				// 팝업 닫기
				$$("add_favority_query_popup").hide();
			}}
		]},
	],
	elementsConfig:{
		labelPosition:"top"
	}
};

//즐겨찾는 쿼리 추가 창
var addFavorityQueryPopup = function(obj){
	// 쿼리 value 입력
	add_favority_query_form.elements[1].value=obj.getAttribute("data");

	webix.ui({
        view:"window",
        id:"add_favority_query_popup",
        width:300,
        position:"center",
        modal:true,
        head:"즐겨 찾는 쿼리 추가",
        body:webix.copy(add_favority_query_form)
    }).show();
    $$("favority_memo").focus();
};