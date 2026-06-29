-- =============================================
-- PACKAGE SPEC: DATE_CNVRTR_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
PACKAGE DATE_CNVRTR_PKG  IS
  FUNCTION GREGORIAN_TO_HIJRI(P_DATE DATE) RETURN DATE;
  FUNCTION HIJRI_TO_GREGORIAN(P_DATE DATE) RETURN DATE;
  FUNCTION GET_MNTH_NM (P_DATE DATE,P_LNG_NO NUMBER DEFAULT 1)	RETURN VARCHAR2;
  FUNCTION GET_CLNDR_NM(P_CLNDR_TYP IN NUMBER) RETURN VARCHAR2;
  FUNCTION CONVERT_DATE(P_CLNDR_NM IN VARCHAR , P_DATE DATE) RETURN VARCHAR2;
END DATE_CNVRTR_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: DATE_CNVRTR_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY DATE_CNVRTR_PKG IS
--##---------------------------------------------------------------------------------------------------------------##--
FUNCTION INTPART(FLOATNUM FLOAT) RETURN FLOAT IS
BEGIN
    IF (FLOATNUM< -0.0000001) THEN
	 RETURN CEIL(FLOATNUM-0.0000001);
    END IF;
   RETURN FLOOR(FLOATNUM+0.0000001)    ;
END INTPART ;
--##---------------------------------------------------------------------------------------------------------------##--
FUNCTION GREGORIAN_TO_HIJRI(P_DATE DATE) RETURN DATE IS
  JD NUMBER;
  L  NUMBER;
  N  NUMBER;
  J  NUMBER;
  D  NUMBER:= TO_CHAR(P_DATE,'DD');
  M  NUMBER:= TO_CHAR(P_DATE,'MM');
  Y  NUMBER:= TO_CHAR(P_DATE,'YYYY');
BEGIN
--##---------------------------------------------------------------------------------------------------------------##--
    IF P_DATE IS NULL THEN
	 RETURN NULL;
    END IF;
--##---------------------------------------------------------------------------------------------------------------##--
    IF ((Y>1582)OR((Y=1582)AND(M>10))OR((Y=1582)AND(M=10)AND(D>14)))  THEN
	    JD:=INTPART((1461*(Y+4800+INTPART((M-14)/12)))/4)+INTPART((367*(M-2-12*(INTPART((M-14)/12))))/12)-
	    INTPART( (3* (INTPART(  (Y+4900+	INTPART( (M-14)/12)	)/100)	  )   ) /4)+D-32075;
    ELSE
	 JD := 367*Y-INTPART((7*(Y+5001+INTPART((M-9)/7)))/4)+INTPART((275*M)/9)+D+1729777;
    END IF;
    L:=JD-1948440+10632;
    N:=INTPART((L-1)/10631);
    L:=L-10631*N+354;
    J:=(INTPART((10985-L)/5316))*(INTPART((50*L)/17719))+(INTPART(L/5670))*(INTPART((43*L)/15238));
    L:=L-(INTPART((30-J)/15))*(INTPART((17719*J)/50))-(INTPART(J/16))*(INTPART((15238*J)/43))+29;
    M:=INTPART((24*L)/709);
    D:=L-INTPART((709*M)/24);
    Y:=30*N+J-30;
    RETURN TO_DATE(LPAD(D,2,'0') || LPAD(M,2,'0')|| LPAD(Y,4,'0'),'DDMMYYYY');
END GREGORIAN_TO_HIJRI;
--##---------------------------------------------------------------------------------------------------------------##--
FUNCTION HIJRI_TO_GREGORIAN(P_DATE DATE) RETURN DATE IS
  JD NUMBER;
  L  NUMBER;
  N  NUMBER;
  J  NUMBER;
  I  NUMBER;
  K  NUMBER;
  D  NUMBER:= TO_CHAR(P_DATE,'DD');
  M  NUMBER:= TO_CHAR(P_DATE,'MM');
  Y  NUMBER:= TO_CHAR(P_DATE,'YYYY');
BEGIN
--##---------------------------------------------------------------------------------------------------------------##--
    IF P_DATE IS NULL THEN
	 RETURN NULL;
    END IF;
--##---------------------------------------------------------------------------------------------------------------##--

    JD:=INTPART((11*Y+3)/30)+354*Y+30*M-INTPART((M-1)/2)+D+1948440-385;
    IF (JD> 2299160 ) THEN
	L:=JD+68569;
	N:=INTPART((4*L)/146097);
	L:=L-INTPART((146097*N+3)/4);
	I:=INTPART((4000*(L+1))/1461001);
	L:=L-INTPART((1461*I)/4)+31;
	J:=INTPART((80*L)/2447);
	D:=L-INTPART((2447*J)/80);
	L:=INTPART(J/11);
	M:=J+2-12*L;
	Y:=100*(N-49)+I+L;
    ELSE
	J:=JD+1402;
	K:=INTPART((J-1)/1461);
	L:=J-1461*K;
	N:=INTPART((L-1)/365)-INTPART(L/1461);
	I:=L-365*N+30;
	J:=INTPART((80*I)/2447);
	D:=I-INTPART((2447*J)/80);
	I:=INTPART(J/11);
	M:=J+2-12*I;
	Y:=4*K+N+I-4716;
    END IF;
    RETURN TO_DATE(LPAD(D,2,'0') || LPAD(M,2,'0')|| LPAD(Y,4,'0'),'DDMMYYYY');

END HIJRI_TO_GREGORIAN ;
--##---------------------------------------------------------------------------------------------------------------##--
FUNCTION GET_MNTH_NM (P_DATE DATE,P_LNG_NO NUMBER DEFAULT 1)  RETURN VARCHAR2 IS
 V_Mnth_Nm  Varchar2(30);
 V_Lng_Nm Varchar2(99):='ARABIC';
Begin
  If P_Lng_No =1 Then
     V_Lng_Nm:='ARABIC';
  Elsif P_Lng_No =2 Then
     V_Lng_Nm:='AMERICAN';
  Elsif P_Lng_No =3 Then
     V_Lng_Nm:='FRENCH';
  Elsif P_Lng_No =4 Then
     V_Lng_Nm:='TURKISH';
  Elsif P_Lng_No =5 Then
     V_Lng_Nm:='GERMAN';
  End If;



  Select To_Char(P_Date,'Month','NLS_DATE_LANGUAGE='||V_Lng_Nm)
  Into V_Mnth_Nm
  From Dual;

  Return V_Mnth_Nm;

Exception
  When Others Then
   Return Null;
END GET_MNTH_NM ;
--##---------------------------------------------------------------------------------------------------------------##--
FUNCTION GET_CLNDR_NM(P_CLNDR_TYP IN NUMBER) RETURN VARCHAR2 IS
V_CLNDR_ALUE  VARCHAR2(200);
V_CLNDR_TYP  NUMBER;
BEGIN

IF P_CLNDR_TYP = 1 THEN

       SELECT SYS_CLNDR
       INTO V_CLNDR_TYP
       FROM IAS_PARA_GEN
       WHERE PARA_NO = 1;

	SELECT CLNDR_VALUE
	INTO V_CLNDR_ALUE
	FROM S_CLNDR_LIST
	WHERE CLNDR_CODE = V_CLNDR_TYP;
ELSE
	  SELECT CORR_CLNDR
       INTO V_CLNDR_TYP
       FROM IAS_PARA_GEN
       WHERE PARA_NO = 1;

	SELECT CLNDR_VALUE
	INTO V_CLNDR_ALUE
	FROM S_CLNDR_LIST
	WHERE CLNDR_CODE = V_CLNDR_TYP;
END IF;
	RETURN V_CLNDR_ALUE ;

EXCEPTION WHEN OTHERS THEN
	RETURN NULL ;
END GET_CLNDR_NM;
--##---------------------------------------------------------------------------------------------------------------##--
FUNCTION CONVERT_DATE(P_CLNDR_NM IN VARCHAR , P_DATE DATE) RETURN VARCHAR2 IS
V_DATE DATE;
BEGIN
   IF P_CLNDR_NM IS NOT NULL AND UPPER(P_CLNDR_NM) = UPPER('GREGORIAN') THEN
     V_DATE := GREGORIAN_TO_HIJRI(P_DATE);
  ELSIF UPPER(P_CLNDR_NM) = UPPER('ARABIC HIJRAH') THEN
     V_DATE := HIJRI_TO_GREGORIAN(P_DATE);
   END IF;
   RETURN (V_DATE);
EXCEPTION WHEN OTHERS THEN
	RETURN NULL ;
END CONVERT_DATE;
END DATE_CNVRTR_PKG;
/
