-- =============================================
-- PACKAGE SPEC: GNR_XML_JSON_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
PACKAGE GNR_XML_JSON_PKG IS
    FUNCTION GNRT_XML_TO_JSON_FNC ( P_XML_STR  IN VARCHAR2 ) RETURN CLOB ;

    FUNCTION GNRT_JSON_TO_XML_FNC ( P_JSON_STR	IN VARCHAR2 ) RETURN CLOB ;

    FUNCTION GNRT_XML_JSON_QUERY_OUTPUT_FNC ( P_SQL_STMNT  IN VARCHAR2 ,
					      P_OUTPUT_TYP IN VARCHAR2 ) RETURN CLOB ;


END GNR_XML_JSON_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: GNR_XML_JSON_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY GNR_XML_JSON_PKG IS
--##=============================================================================================##--
    FUNCTION GNRT_XML_TO_JSON_FNC ( P_XML_STR  IN VARCHAR2 ) RETURN CLOB IS
      /*
      L_XML SYS.XMLTYPE := SYS.XMLTYPE('<departments>
					  <department>
					    <department_number>10</department_number>
					    <department_name>ACCOUNTING</department_name>
					  </department>
					  <department>
					    <department_number>20</department_number>
					    <department_name>RESEARCH</department_name>
					  </department>
					</departments>');
      */
      L_XML SYS.XMLTYPE := SYS.XMLTYPE(P_XML_STR);
    BEGIN
      APEX_JSON.INITIALIZE_CLOB_OUTPUT;

      APEX_JSON.WRITE(L_XML);

    --DBMS_OUTPUT.PUT_LINE(APEX_JSON.get_clob_output);
      RETURN(APEX_JSON.get_clob_output);
      APEX_JSON.free_output;
    END GNRT_XML_TO_JSON_FNC ;
--##=============================================================================================##--
    FUNCTION GNRT_JSON_TO_XML_FNC ( P_JSON_STR	IN VARCHAR2 ) RETURN CLOB IS
       L_JSON VARCHAR2(32767) := P_JSON_STR ;
       L_XML  XMLTYPE;
    BEGIN
      /*
      L_JSON := '[
		   {"department_number":10,"department_name":"ACCOUNTING"},
		   {"department_number":20,"department_name":"RESEARCH"}
		 ]';
      */

      L_XML := APEX_JSON.TO_XMLTYPE(L_JSON );
    --DBMS_OUTPUT.PUT_LINE(L_XML.GETCLOBVAL());
      RETURN(L_XML.GETCLOBVAL());
    END GNRT_JSON_TO_XML_FNC ;
--##=============================================================================================##--
    FUNCTION GNRT_XML_JSON_QUERY_OUTPUT_FNC ( P_SQL_STMNT  IN VARCHAR2 ,
					      P_OUTPUT_TYP IN VARCHAR2 ) RETURN CLOB IS
      V_RSLT	CLOB;
      V_REF_CUR SYS_REFCURSOR;

    BEGIN

       IF     P_OUTPUT_TYP = 1	THEN -- XML

	      V_RSLT := DBMS_XMLGEN.GETXML(P_SQL_STMNT)  ;

       ELSIF  P_OUTPUT_TYP = 2	THEN -- JSON

	      OPEN V_REF_CUR FOR(P_SQL_STMNT);
	      APEX_JSON.INITIALIZE_CLOB_OUTPUT;
	      APEX_JSON.WRITE('ROWS',V_REF_CUR);
	      V_RSLT:=APEX_JSON.GET_CLOB_OUTPUT;
	      V_RSLT := REGEXP_REPLACE(V_RSLT, '(\\)[\/]', '/');
	      V_RSLT := REGEXP_REPLACE(V_RSLT, '\\', '\\\\');
	      V_RSLT := REPLACE(V_RSLT, '\\u', '\');
	      V_RSLT := YS_JSON_PKG.UNISTR_CLOB(V_RSLT);
	    --DBMS_OUTPUT.PUT_LINE(V_RSLT);
	      APEX_JSON.FREE_OUTPUT;

       ELSIF  P_OUTPUT_TYP = 3	THEN -- QUERY
	      V_RSLT :=  P_SQL_STMNT ;
       END IF ;

       RETURN( V_RSLT ) ;

    END GNRT_XML_JSON_QUERY_OUTPUT_FNC ;
--##=============================================================================================##--
END GNR_XML_JSON_PKG;
/
