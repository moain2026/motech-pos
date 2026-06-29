-- =============================================
-- PACKAGE SPEC: GNR_DOC_TYP_SQ_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
Package Gnr_Doc_Typ_Sq_Pkg As

Function Get_Doc_Typ_Sq_Fnc ( P_Doc_Typ   IN Number,
			      P_CMP_NO	  IN NUMBER) Return Varchar2;

Procedure Set_Sys_Doc_Id_Prc(  P_Doc_Typ       In Number,
			       P_Doc_Srl       In Number,
			       P_CMP_NO        In Number,
			       P_Tbl_Nm        In Varchar2  Default Null,
			       P_Srl_Fld_Nm    In Varchar2  Default Null,
			       P_Frm_St        In Varchar2  Default Null);
FUNCTION Get_Use_E_Invoice_Fnc ( P_Doc_Typ	 In Number,
				 P_Cmp_No	 In Number) RETURN NUMBER;

End Gnr_Doc_Typ_Sq_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: GNR_DOC_TYP_SQ_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY GNR_DOC_TYP_SQ_PKG AS

FUNCTION GET_DOC_TYP_SQ_FNC (P_DOC_TYP IN NUMBER, P_CMP_NO  IN NUMBER) RETURN VARCHAR2 IS

    V_DOC_TYP_CODE	VARCHAR2(4);
    V_DOC_TYP_GRP	NUMBER(5);
    V_SYS_NO		NUMBER(5);
    V_SYS_DOC_NO	NUMBER;
    V_SYS_DOC_NO_TMP	NUMBER;
    V_SYS_DOC_ID	VARCHAR2(42);
    V_WHR_CNDTN 	VARCHAR2(1000);
    V_SLCT_CNDTN_SCHM	VARCHAR2(1500);
    V_SLCT		VARCHAR2(4000);

BEGIN

    BEGIN

	   IF P_DOC_TYP IS NOT NULL THEN
	      BEGIN
		  EXECUTE IMMEDIATE ('SELECT DOC_TYP_CODE,DOC_TYP_GRP,WHR_CNDTN,SLCT_CNDTN_SCHM FROM IAS_DOC_TYP_SQ_GRP WHERE DOC_TYP='||P_DOC_TYP||' AND ROWNUM<=1 ')
			       INTO V_DOC_TYP_CODE,V_DOC_TYP_GRP,V_WHR_CNDTN,V_SLCT_CNDTN_SCHM;
		  EXECUTE IMMEDIATE ('SELECT SYS_NO FROM GNR_DDC_TBL WHERE DOC_TYP='||P_DOC_TYP) INTO V_SYS_NO;
	      EXCEPTION WHEN OTHERS THEN
		RETURN(NULL);
	      END;
	   END IF;

	   IF V_DOC_TYP_CODE IS NOT NULL AND V_DOC_TYP_GRP IS NOT NULL AND V_SYS_NO IS NOT NULL THEN

	      FOR I IN (SELECT TBL_MST_NM FROM GNR_DDC_TBL DC WHERE EXISTS (SELECT 1 FROM IAS_DOC_TYP_SQ_GRP GR
											    WHERE GR.DOC_TYP = DC.DOC_TYP
											      AND GR.DOC_TYP_GRP = V_DOC_TYP_GRP
											      AND ROWNUM<=1 ))
	      LOOP

		 IF I.TBL_MST_NM IS NOT NULL THEN


		    V_SLCT:='SELECT NVL(MAX(TO_NUMBER(REGEXP_SUBSTR(SYS_DOC_ID,LOWER(''\d+''),1,3))),0)+1 '
			  ||' FROM '||I.TBL_MST_NM||' WHERE CMP_NO='||P_CMP_NO
			  ||' '||V_WHR_CNDTN||' '
			  ||' '||V_SLCT_CNDTN_SCHM||' ';

		    EXECUTE IMMEDIATE (V_SLCT) INTO V_SYS_DOC_NO_TMP;

		    IF V_SYS_DOC_NO_TMP > NVL(V_SYS_DOC_NO,0) THEN
		       V_SYS_DOC_NO := V_SYS_DOC_NO_TMP;
		    END IF;

		 END IF;

	      END LOOP;

	      IF V_SYS_DOC_NO IS NOT NULL THEN
		V_SYS_DOC_ID := V_DOC_TYP_CODE||'-'||V_SYS_NO||'-'||TO_CHAR(CURRENT_TIMESTAMP,'YYYYMMDDHH24MISSFF6')||'-'||V_SYS_DOC_NO;

	      END IF;

	   END IF;


    EXCEPTION WHEN OTHERS THEN
       --RAISE_APPLICATION_ERROR (-20003,IAS_GEN_PKG.GET_MSG(P_LNG_NO => NVL(IAS_PRMTR_PKG.G_LANG_NO,2),P_MSG_NO => 6127 )||CHR(13)||'ERR WHEN GET_DOC_TYP_SQ_FNC, '||CHR(13)||SQLERRM);
       null ;
    END;

    RETURN(V_SYS_DOC_ID);

END GET_DOC_TYP_SQ_FNC;

Procedure Set_Sys_Doc_Id_Prc(  P_Doc_Typ       In Number,
			       P_Doc_Srl       In Number,
			       P_CMP_NO        IN NUMBER,
			       P_Tbl_Nm        In Varchar2  Default Null,
			       P_Srl_Fld_Nm    In Varchar2  Default Null,
			       P_Frm_St        In Varchar2  Default Null)IS
    V_Cnt	   Number:=0;
    V_Cnt2	   Number:=0;
    V_APPROVED	   Number:=5;
    V_Row_Updt	   Number:=0;
    V_SYS_DOC_ID   Varchar2(42);
    V_Tbl_Nm	   Varchar2(100):=P_Tbl_Nm;
    V_Srl_Fld_Nm   Varchar2(100):=P_Srl_Fld_Nm;
    V_UPDT_WHR	   Varchar2(1000);
BEGIN

    Begin
	Select TBL_MST_NM, TBL_DOCSRL_NM
	    Into V_Tbl_Nm, V_Srl_Fld_Nm
	    From GNR_DDC_TBL
	   Where DOC_TYP = P_Doc_Typ
	     And Rownum<=1;
    Exception When Others Then
	Return;
    End;

    IF UPPER(V_Tbl_Nm) <> UPPER(P_Tbl_Nm) OR UPPER(V_Srl_Fld_Nm) <> UPPER(P_Srl_Fld_Nm) Then
       Return;
    End IF;

    Begin

       EXECUTE IMMEDIATE ' SELECT NVl(SYS_DOC_ID,''0'') FROM ' || V_TBL_NM ||
			 '  WHERE ' || V_Srl_Fld_Nm || ' = ' || P_Doc_Srl Into V_SYS_DOC_ID ;

    Exception When Others Then
       Return;
    End;

    BEGIN
	EXECUTE IMMEDIATE ('SELECT UPDT_WHR FROM IAS_DOC_TYP_SQ_GRP WHERE DOC_TYP='||P_DOC_TYP||' AND ROWNUM<=1 ')
		     INTO V_UPDT_WHR;
    EXCEPTION WHEN OTHERS THEN
	V_UPDT_WHR := ' ';
    END;

    IF V_SYS_DOC_ID ='0' And P_Frm_St = 'I' Then
	Begin

	    EXECUTE IMMEDIATE ' UPDATE ' || V_TBL_NM ||
			      '    SET SYS_DOC_ID = ''' || GNR_DOC_TYP_SQ_PKG.GET_DOC_TYP_SQ_FNC(P_DOC_TYP=>P_Doc_Typ, P_CMP_NO=>P_CMP_NO) ||
			      '''  WHERE ' || V_Srl_Fld_Nm || ' = ' || P_Doc_Srl ||' '|| V_UPDT_WHR;

	Exception When Others Then

	  --  RAISE_APPLICATION_ERROR (-20004,IAS_GEN_PKG.GET_MSG(P_LNG_NO => NVL(IAS_PRMTR_PKG.G_LANG_NO,2),P_MSG_NO => 6127 )||CHR(13)||'Err In Set_Sys_Doc_Id_Prc, '||CHR(13)||SQLERRM);
	  null;
	End;
    End IF;

END Set_Sys_Doc_Id_Prc;


FUNCTION Get_Use_E_Invoice_Fnc ( P_Doc_Typ	 In Number,
				 P_Cmp_No	 In Number) RETURN NUMBER Is
V_USE_E_INVOICE_G   NUMBER;
V_USE_E_INVOICE_C   NUMBER;
V_ELCTRNC_DOC_FLG   NUMBER;
V_CNTRY_NO	    NUMBER;
V_CNTRY_2_LTR	    VARCHAR2(2);
Begin

    SELECT NVL(G.USE_E_INVOICE,0),
	   NVL(C.USE_E_INVOICE,0),
	   C.CNTRY_NO
      INTO V_USE_E_INVOICE_G,
	   V_USE_E_INVOICE_C,
	   V_CNTRY_NO
      FROM IAS_PARA_GEN G, S_CMPNY C
      WHERE C.CMP_NO= P_Cmp_No;

    IF V_USE_E_INVOICE_G = 1 AND  V_USE_E_INVOICE_C = 1 THEN
       IF V_CNTRY_NO IS NOT NULL THEN
	   BEGIN
	      SELECT CNTRY_2_LTR INTO V_CNTRY_2_LTR FROM CNTRY WHERE CNTRY_NO=V_CNTRY_NO;
	   Exception When others Then
	      V_CNTRY_2_LTR:=NULL;
	   END;
       END IF;
       BEGIN
	  SELECT NVL(ELCTRNC_DOC_FLG,0) INTO V_ELCTRNC_DOC_FLG FROM IAS_DOC_TYP_SQ_GRP WHERE CNTRY_2_LTR_CODE=NVL(V_CNTRY_2_LTR,'A') AND DOC_TYP=P_DOC_TYP;
       Exception
	  When NO_DATA_FOUND Then
	      BEGIN
		  SELECT NVL(ELCTRNC_DOC_FLG,0) INTO V_ELCTRNC_DOC_FLG FROM IAS_DOC_TYP_SQ_GRP WHERE CNTRY_2_LTR_CODE='A' AND DOC_TYP=P_DOC_TYP;
	      Exception When others Then
		  Return 0;
	      END;
	  When others Then
	      Return 0;
       END;
    ELSE
       RETURN(0);
    END IF;

    Return (V_ELCTRNC_DOC_FLG);

 Exception When others Then
   Return 0;
End Get_Use_E_Invoice_Fnc;

END GNR_DOC_TYP_SQ_PKG;
/
