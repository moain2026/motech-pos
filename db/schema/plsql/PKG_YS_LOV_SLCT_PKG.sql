-- =============================================
-- PACKAGE SPEC: YS_LOV_SLCT_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
PACKAGE Ys_Lov_Slct_Pkg AS
  TYPE Data_Rcrd IS RECORD ( R_Col1  VARCHAR2(2000)) ;
  TYPE T_Slct_Data IS TABLE OF Data_Rcrd Index By Binary_Integer;
  V_Slct_Data	T_Slct_Data;
  V_Data_Rcrd Data_Rcrd;
  TYPE Rcrd_Cv IS REF CURSOR RETURN Data_Rcrd;
  TYPE Rcrd_Tbl IS TABLE OF Data_Rcrd;
  PROCEDURE Clr_Data  ;
  PROCEDURE Slct_Data ( P_Col1 In Varchar2) ;
  PROCEDURE Deslct_Data (P_Col1 In Varchar2);
  FUNCTION  Pop_Slct_Data RETURN RCRD_TBL PIPELINED;
  PROCEDURE Fetch_Slct_Data ( SQL_CV IN OUT RCRD_CV);
END Ys_Lov_Slct_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: YS_LOV_SLCT_PKG  (status: VALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY Ys_Lov_Slct_Pkg AS
-----------------------------------------------------------
PROCEDURE Clr_Data Is
BEGIN
  V_Slct_Data.Delete;
END;
-----------------------------------------------------------
PROCEDURE Slct_Data  ( P_Col1 In Varchar2)  Is
Begin

  V_Slct_Data(V_Slct_Data.Count+1).R_Col1 := P_Col1 ;

End;
-----------------------------------------------------------
PROCEDURE Deslct_Data (P_Col1 In Varchar2) Is
 Begin

     If V_Slct_Data.Count > 0	Then
      For Ndx In V_Slct_Data.First..V_Slct_Data.Last Loop
	      If V_Slct_Data.Exists (Ndx)  Then
		 ----------------------------------------------
		 If V_Slct_Data(Ndx).R_Col1 = P_Col1 Then
		   ----------------------------------------------
		   V_Slct_Data.Delete (Ndx);
		   ----------------------------------------------
		 End If;
	      End If;
      End Loop;
    End If;
 End;
-----------------------------------------------------------
FUNCTION POP_SLCT_Data RETURN RCRD_TBL PIPELINED
 IS
     PRAGMA AUTONOMOUS_TRANSACTION;

     TYPE RF_DT IS REF CURSOR;
     RFC_Data	 RF_DT;

     DSH_FILL	 Data_RCRD;

 BEGIN

    If V_Slct_Data.Count > 0   Then
      For Ndx In V_Slct_Data.First..V_Slct_Data.Last Loop
	      If V_Slct_Data.Exists (Ndx)  Then
		 ----------------------------------------------
		 SELECT V_Slct_Data(Ndx).R_Col1 INTO V_Data_Rcrd FROM DUAL;
		 ----------------------------------------------
		 PIPE ROW(V_Data_RCRD);
		 ----------------------------------------------
	      End If;
      End Loop;

    End If;
 EXCEPTION
      WHEN OTHERS THEN
	 Raise_application_error(-20201,' Error When Fetch Data. '|| chr(13) || SqlErrm);
END POP_SLCT_Data;
-----------------------------------------------------------
PROCEDURE Fetch_Slct_Data ( SQL_CV IN OUT Rcrd_CV) IS
BEGIN

    OPEN SQL_CV FOR
       SELECT R_Col1
	      FROM TABLE(POP_SLCT_Data) ;

   EXCEPTION
      WHEN OTHERS THEN
	 Raise_application_error(-20202,' Error When Fetch Data. '|| chr(13) || SqlErrm);
END Fetch_Slct_Data;
End Ys_Lov_Slct_Pkg;
/
