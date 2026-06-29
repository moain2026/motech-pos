-- =============================================
-- PACKAGE SPEC: IAS_PRMTR_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE IAS_PRMTR_PKG	IS
    G_BRN_YEAR	     NUMBER(4);
    G_USER_NO	     USER_R.U_ID%TYPE;
    G_LANG_NO	     NUMBER;
    G_LOCAL_CUR      EX_RATE.CUR_CODE%TYPE;
FUNCTION    GetPval (P_Prmtr VARCHAR2)				  RETURN VARCHAR2;
PROCEDURE   SetPval(P_Prmtr VARCHAR2,  P_Val VARCHAR2);
END IAS_PRMTR_PKG ;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_PRMTR_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY IAS_PRMTR_PKG IS

FUNCTION    GetPval(p_prmtr VARCHAR2)  RETURN VARCHAR2 IS
BEGIN


       If  'G_BRN_YEAR'  ='G_'||p_prmtr   Then
	   RETURN IAS_PRMTR_PKG.G_BRN_YEAR  ;
       ElsIf  'G_USER_NO'  ='G_'||p_prmtr   Then
	   RETURN IAS_PRMTR_PKG.G_USER_NO;
       ElsIf  'G_LANG_NO'  ='G_'||p_prmtr   Then
	   RETURN IAS_PRMTR_PKG.G_LANG_NO  ;
       ElsIf 'G_LOCAL_CUR'  ='G_'||p_prmtr   Then
	   RETURN IAS_PRMTR_PKG.G_LOCAL_CUR  ;
       END IF;


 RETURN '';

END GetPval;
/*_____________________________________________________________________*/
PROCEDURE   SetPval(p_prmtr VARCHAR2,p_val VARCHAR2) IS

BEGIN


       IF  'G_BRN_YEAR'  ='G_'||p_prmtr   Then
	    IAS_PRMTR_PKG.G_BRN_YEAR  :=to_number (p_val) ;
       ELSIF  'G_USER_NO'  ='G_'||p_prmtr   Then
	    IAS_PRMTR_PKG.G_USER_NO:=to_number (p_val) ;
       ELSIF  'G_LANG_NO'  ='G_'||p_prmtr   Then
	    IAS_PRMTR_PKG.G_LANG_NO  :=to_number (p_val) ;
       ElsIf 'G_LOC_CUR'  ='G_'||p_prmtr   Then
	    IAS_PRMTR_PKG.G_LOCAL_CUR := (p_val) ;
       END IF;




END SetPval;
/*_____________________________________________________________________*/

END IAS_PRMTR_PKG;
/
