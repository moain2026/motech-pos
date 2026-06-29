-- =============================================
-- PACKAGE SPEC: ADM_INSRT_TRNS_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE ADM_INSRT_TRNS_PKG IS
G_LNG_NO      NUMBER;
--##-------------------------------------------------------------------------------------------------------------------------##---
PROCEDURE CLR_GLBL_VAR ;
--##-------------------------------------------------------------------------------------------------------------------------##---
PROCEDURE UPDT_S_FLD_DFLT_USR ( P_U_ID	      IN S_FLD_DFLT_USR.U_ID%TYPE	   DEFAULT NULL,
				P_FLD_NM      IN S_FLD_DFLT_USR.FLD_NM %TYPE	   DEFAULT NULL,
				P_FLD_VAL     IN S_FLD_DFLT_USR.FLD_VAL%TYPE	   DEFAULT NULL,
				P_AD_U_ID     IN S_FLD_DFLT_USR.AD_U_ID%TYPE	   DEFAULT NULL,
				P_AD_DATE     IN S_FLD_DFLT_USR.AD_DATE%TYPE	   DEFAULT NULL,
				P_AD_TRMNL_NM IN S_FLD_DFLT_USR.AD_TRMNL_NM%TYPE   DEFAULT NULL,
				P_UP_U_ID     IN S_FLD_DFLT_USR.UP_U_ID%TYPE	   DEFAULT NULL,
				P_UP_DATE     IN S_FLD_DFLT_USR.UP_DATE%TYPE	   DEFAULT NULL,
				P_UP_CNT      IN S_FLD_DFLT_USR.UP_CNT%TYPE	   DEFAULT NULL,
				P_UP_TRMNL_NM IN S_FLD_DFLT_USR.UP_TRMNL_NM%TYPE   DEFAULT NULL	 );
--##-------------------------------------------------------------------------------------------------------------------------##---
FUNCTION RPLC_GNR_PRMTR_FNC( P_SQL IN VARCHAR ) RETURN VARCHAR2;
--##-------------------------------------------------------------------------------------------------------------------------##---
FUNCTION GET_LOV_RTRN_FLD_NM_FNC ( P_FLD_LOV_NM 	   IN S_FLD_DFLT.FLD_LOV_NM%TYPE	      DEFAULT NULL,
				   P_FLD_VAL		   IN S_FLD_DFLT_USR.FLD_VAL%TYPE	      DEFAULT NULL,
				   P_FLD_LOV_WHR	   IN S_FLD_DFLT.FLD_LOV_WHR%TYPE	      DEFAULT NULL,
				   P_FLD_LOV_WHR_CLMN_NM   IN S_FLD_DFLT.FLD_LOV_WHR_CLMN_NM%TYPE     DEFAULT NULL,
				   P_FLD_LOV_RTRN_CLMN_NM  IN S_FLD_DFLT.FLD_LOV_RTRN_CLMN_NM%TYPE    DEFAULT NULL ) RETURN VARCHAR2;
--##-------------------------------------------------------------------------------------------------------------------------##---
END ADM_INSRT_TRNS_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: ADM_INSRT_TRNS_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY ADM_INSRT_TRNS_PKG IS
--##-------------------------------------------------------------------------------------------------------------------------##---
PROCEDURE CLR_GLBL_VAR IS
BEGIN
G_LNG_NO	:=NULL;

END CLR_GLBL_VAR;
--##-------------------------------------------------------------------------------------------------------------------------##---
PROCEDURE UPDT_S_FLD_DFLT_USR ( P_U_ID	      IN S_FLD_DFLT_USR.U_ID%TYPE	   DEFAULT NULL,
				P_FLD_NM      IN S_FLD_DFLT_USR.FLD_NM %TYPE	   DEFAULT NULL,
				P_FLD_VAL     IN S_FLD_DFLT_USR.FLD_VAL%TYPE	   DEFAULT NULL,
				P_AD_U_ID     IN S_FLD_DFLT_USR.AD_U_ID%TYPE	   DEFAULT NULL,
				P_AD_DATE     IN S_FLD_DFLT_USR.AD_DATE%TYPE	   DEFAULT NULL,
				P_AD_TRMNL_NM IN S_FLD_DFLT_USR.AD_TRMNL_NM%TYPE   DEFAULT NULL,
				P_UP_U_ID     IN S_FLD_DFLT_USR.UP_U_ID%TYPE	   DEFAULT NULL,
				P_UP_DATE     IN S_FLD_DFLT_USR.UP_DATE%TYPE	   DEFAULT NULL,
				P_UP_CNT      IN S_FLD_DFLT_USR.UP_CNT%TYPE	   DEFAULT NULL,
				P_UP_TRMNL_NM IN S_FLD_DFLT_USR.UP_TRMNL_NM%TYPE   DEFAULT NULL	 )IS
BEGIN
    IF P_U_ID IS NULL OR P_FLD_NM IS NULL THEN
       RETURN;
    END IF;
    IF P_FLD_VAL IS NULL THEN -- DELETE RECORD
       DELETE FROM S_FLD_DFLT_USR WHERE U_ID=P_U_ID And FLD_NM=P_FLD_NM;
    ELSE -- INSERT OR UPDATE RECORD
       BEGIN
	   INSERT INTO S_FLD_DFLT_USR ( U_ID, FLD_NM, FLD_VAL,
					AD_U_ID, AD_DATE, AD_TRMNL_NM)
				VALUES (P_U_ID, P_FLD_NM, P_FLD_VAL,
					P_AD_U_ID, P_AD_DATE, P_AD_TRMNL_NM);
       EXCEPTION WHEN OTHERS THEN
	   UPDATE S_FLD_DFLT_USR
	   SET FLD_VAL=P_FLD_VAL,
	       UP_U_ID=P_UP_U_ID,
	       UP_DATE=P_UP_DATE,
	       UP_CNT=P_UP_CNT,
	       UP_TRMNL_NM=P_UP_TRMNL_NM
	 WHERE U_ID=P_U_ID And FLD_NM=P_FLD_NM;
       END;

    END IF;
EXCEPTION WHEN OTHERS THEN
    Raise_Application_Error (-20001,'Error In UPDT_S_FLD_DFLT_USR '||CHR(10)||SQLERRM||CHR(10));
END UPDT_S_FLD_DFLT_USR;
--##-------------------------------------------------------------------------------------------------------------------------##---
FUNCTION RPLC_GNR_PRMTR_FNC( P_SQL IN VARCHAR ) RETURN VARCHAR2 IS
  V_sql   VARCHAR( 4000 );
BEGIN

    V_sql	:= UPPER( P_sql );
    ------------------------------------------------
	V_sql := REPLACE(  V_sql , ':PARAMETER.BRN_YEAR', Ias_Prmtr_Pkg.Getpval(P_Prmtr =>'BRN_YEAR'));
	V_sql := REPLACE(  V_sql , ':PARAMETER.LANG_NO', NVL(Ias_Prmtr_Pkg.Getpval(P_Prmtr =>'LANG_NO'),1) );
	V_sql := REPLACE(  V_sql , ':PARAMETER.LANG_DFLT', NVL(Ias_Prmtr_Pkg.Getpval(P_Prmtr =>'LANG_DFLT'),1) );
	V_sql := REPLACE(  V_sql , ':PARAMETER.USER_NO', NVL(Ias_Prmtr_Pkg.Getpval(P_Prmtr =>'USER_NO'),1) );
	V_sql := REPLACE(  V_sql , ':PARAMETER.U_ID', NVL(Ias_Prmtr_Pkg.Getpval(P_Prmtr =>'USER_NO'),1) );
	V_sql := REPLACE(  V_sql , ':PARAMETER.FORM_NO', Ias_Prmtr_Pkg.Getpval(P_Prmtr =>'FORM_NO') );
	V_sql := REPLACE(  V_sql , ':PARAMETER.LOCAL_CUR', Ias_Prmtr_Pkg.Getpval(P_Prmtr =>'LOCAL_CUR') );	
	V_sql := REPLACE(  V_sql , ':PARAMETER.SCR_TYP', Nvl(Ias_Prmtr_Pkg.Getpval(P_Prmtr =>'SCR_TYP'),3) );	
	------------------------------------------------			  				
  RETURN V_sql;

END RPLC_GNR_PRMTR_FNC;
--##-------------------------------------------------------------------------------------------------------------------------##---
FUNCTION GET_LOV_RTRN_FLD_NM_FNC ( P_FLD_LOV_NM 	   IN S_FLD_DFLT.FLD_LOV_NM%TYPE	      DEFAULT NULL,
				   P_FLD_VAL		   IN S_FLD_DFLT_USR.FLD_VAL%TYPE	      DEFAULT NULL,
				   P_FLD_LOV_WHR	   IN S_FLD_DFLT.FLD_LOV_WHR%TYPE	      DEFAULT NULL,
				   P_FLD_LOV_WHR_CLMN_NM   IN S_FLD_DFLT.FLD_LOV_WHR_CLMN_NM%TYPE	DEFAULT NULL,
				   P_FLD_LOV_RTRN_CLMN_NM  IN S_FLD_DFLT.FLD_LOV_RTRN_CLMN_NM%TYPE	 DEFAULT NULL ) RETURN VARCHAR2 IS

    CURSOR CUR_LOV IS SELECT LOV_LBL_NO,
			     GET_RPLC_SPC_TXT_FNC (UPPER(LOV_SQL)) LOV_SQL,
			     GET_RPLC_SPC_TXT_FNC (LOV_PRV) LOV_PRV ,
			     DFLT_ORDR,
			     LOV_COL_CNT ,
			     LOV_COL_HID ,
			     LOV_COL_LBL ,
			     LOV_COL_WDTH,
			     LOV_COL_LTR ,
			     LOV_COL_RTL,
			     GRP_BY
			FROM S_LOV_SLCT
		       WHERE UPPER(LOV_NM) = UPPER(P_FLD_LOV_NM)
			 AND ROWNUM<=1;
    V_USER_NO	   NUMBER:=NVL(IAS_PRMTR_PKG.GETPVAL(P_PRMTR =>'USER_NO'),1);
    V_LOV_SQL	   VARCHAR2(32000);
    V_FLD_VALUE    VARCHAR2(500);
BEGIN
    FOR I IN CUR_LOV LOOP
	IF V_USER_NO =1 THEN
		 V_LOV_SQL	 := UPPER(I.LOV_SQL)||' '||UPPER(GET_RPLC_SPC_TXT_FNC (P_FLD_LOV_WHR))||' '||UPPER(I.GRP_BY);
	ELSE
		 V_LOV_SQL	 := UPPER(I.LOV_SQL)||' '||UPPER(I.LOV_PRV)||' '||UPPER(GET_RPLC_SPC_TXT_FNC (P_FLD_LOV_WHR))||' '||UPPER(I.GRP_BY);
	END IF;
    END LOOP;	
    V_LOV_SQL := ADM_INSRT_TRNS_PKG.RPLC_GNR_PRMTR_FNC(P_SQL=>V_LOV_SQL);
    V_LOV_SQL := 'SELECT '||P_FLD_LOV_RTRN_CLMN_NM ||' FROM ('|| V_LOV_SQL ||' ) WHERE '||P_FLD_LOV_WHR_CLMN_NM||' = ';
    BEGIN
       EXECUTE IMMEDIATE (V_LOV_SQL||P_FLD_VAL) INTO  V_FLD_VALUE;
       RETURN (V_FLD_VALUE);
    EXCEPTION WHEN OTHERS  THEN
	CASE SQLCODE WHEN -1722 THEN
	   BEGIN
	      EXECUTE IMMEDIATE (V_LOV_SQL||''''||P_FLD_VAL||'''') INTO  V_FLD_VALUE;
	      RETURN (V_FLD_VALUE);
	   EXCEPTION WHEN OTHERS THEN
	      RETURN(P_FLD_VAL);
	   END;
	END CASE;
	RETURN(P_FLD_VAL);
    END;
EXCEPTION WHEN OTHERS  THEN
    RETURN(P_FLD_VAL);
END GET_LOV_RTRN_FLD_NM_FNC;
--##-------------------------------------------------------------------------------------------------------------------------##---
END ADM_INSRT_TRNS_PKG;
/
