-- =============================================
-- PACKAGE SPEC: YS_ITM_LOV_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
PACKAGE Ys_Itm_Lov_Pkg AS
  TYPE T_Slct_Itms IS TABLE OF Ias_Pos_Bill_Dtl%Rowtype Index By Binary_Integer;

  V_Slct_Itms	T_Slct_Itms;

  TYPE Itm_Rcrd IS RECORD ( R_COL1  VARCHAR2(1000),
			    R_COL2  VARCHAR2(1000),
			    R_COL3  VARCHAR2(1000),
			    R_COL4  VARCHAR2(1000),
			    R_COL5  VARCHAR2(1000),
			    R_COL6  VARCHAR2(1000),
			    R_COL7  VARCHAR2(1000),
			    R_COL8  VARCHAR2(1000),
			    R_COL9  VARCHAR2(1000),
			    R_COL10 VARCHAR2(1000)) ;

  V_Itm_Rcrd ITM_RCRD;

  TYPE Rcrd_Cv IS REF CURSOR RETURN Itm_Rcrd;
  TYPE Rcrd_Tbl IS TABLE OF Itm_Rcrd;

  PROCEDURE Clr_Itm_Lst  ;
  PROCEDURE Slct_Itm   ( P_I_Code      In Ias_Pos_Bill_Dtl.I_Code%Type,
			 P_Itm_Unt     In Ias_Pos_Bill_Dtl.Itm_Unt%Type,
			 P_W_Code      In Ias_Pos_Bill_Dtl.W_Code%Type,
			 P_Expire_Date In Ias_Pos_Bill_Dtl.Expire_Date%Type,
			 P_Batch_No    In Ias_Pos_Bill_Dtl.Batch_No%Type,
			 P_I_Price     In Ias_Pos_Bill_Dtl.I_Price%Type,
			 P_Itm_Inx     In OUT NUMBER ) ;
  PROCEDURE Deslct_Itm (P_Itm_Inx In Number);
  FUNCTION Pop_Slct_Data RETURN RCRD_TBL PIPELINED;
  PROCEDURE Fetch_Slct_Itms ( SQL_CV IN OUT RCRD_CV);
END Ys_Itm_Lov_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: YS_ITM_LOV_PKG  (status: VALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY Ys_Itm_Lov_Pkg AS
-----------------------------------------------------------
PROCEDURE Clr_Itm_Lst Is
BEGIN
  V_Slct_Itms.Delete;
END;
-----------------------------------------------------------
PROCEDURE Slct_Itm    ( P_I_Code      In Ias_Pos_Bill_Dtl.I_Code%Type,
			P_Itm_Unt     In Ias_Pos_Bill_Dtl.Itm_Unt%Type,
			P_W_Code      In Ias_Pos_Bill_Dtl.W_Code%Type,
			P_Expire_Date In Ias_Pos_Bill_Dtl.Expire_Date%Type,
			P_Batch_No    In Ias_Pos_Bill_Dtl.Batch_No%Type,
			P_I_Price     In Ias_Pos_Bill_Dtl.I_Price%Type,
			P_Itm_Inx     In OUT NUMBER )  Is
Begin
  If P_Itm_Inx Is Null And Not V_Slct_Itms.Exists(V_Slct_Itms.Count+1) Then
     P_Itm_Inx := V_Slct_Itms.Count+1;
     V_Slct_Itms(P_Itm_Inx).I_Code	:= P_I_Code ;
     V_Slct_Itms(P_Itm_Inx).Itm_Unt	:= P_Itm_Unt ;
     V_Slct_Itms(P_Itm_Inx).W_Code	:= P_W_Code ;
     V_Slct_Itms(P_Itm_Inx).Expire_Date := P_Expire_Date ;
     V_Slct_Itms(P_Itm_Inx).Batch_No	:= P_Batch_No;
     V_Slct_Itms(P_Itm_Inx).I_Price	:= P_I_Price ;
  ElsIf V_Slct_Itms.Exists (P_Itm_Inx)	Then
     V_Slct_Itms.Delete (P_Itm_Inx);
     V_Slct_Itms(P_Itm_Inx).I_Code	:= P_I_Code ;
     V_Slct_Itms(P_Itm_Inx).Itm_Unt	:= P_Itm_Unt ;
     V_Slct_Itms(P_Itm_Inx).W_Code	:= P_W_Code ;
     V_Slct_Itms(P_Itm_Inx).Expire_Date := P_Expire_Date ;
     V_Slct_Itms(P_Itm_Inx).Batch_No	:= P_Batch_No;
     V_Slct_Itms(P_Itm_Inx).I_Price	:= P_I_Price ;
  End If;
End;
-----------------------------------------------------------
PROCEDURE Deslct_Itm (P_Itm_Inx In Number) Is
 Begin

    If V_Slct_Itms.Exists (P_Itm_Inx)  Then
       V_Slct_Itms.Delete (P_Itm_Inx);
    End If;

 End;
-----------------------------------------------------------
FUNCTION POP_SLCT_DATA RETURN RCRD_TBL PIPELINED
 IS
     PRAGMA AUTONOMOUS_TRANSACTION;

     TYPE RF_DT IS REF CURSOR;
     RFC_DATA	 RF_DT;

     DSH_FILL	 ITM_RCRD;

 BEGIN

    If V_Slct_Itms.Count > 0   Then
      For Ndx In V_Slct_Itms.First..V_Slct_Itms.Last Loop
	      If V_Slct_Itms.Exists (Ndx)  Then
		 ----------------------------------------------
		 SELECT V_Slct_Itms(Ndx).I_Code,V_Slct_Itms(Ndx).Itm_Unt,V_Slct_Itms(Ndx).W_Code,V_Slct_Itms(Ndx).Expire_Date,V_Slct_Itms(Ndx).Batch_No ,V_Slct_Itms(Ndx).I_Price,Null,Null,Null,Null INTO V_ITM_RCRD FROM DUAL;
		 ----------------------------------------------
		 PIPE ROW(V_ITM_RCRD);
		 ----------------------------------------------
	      End If;
      End Loop;

    End If;
 EXCEPTION
      WHEN OTHERS THEN
	 Raise_application_error(-20201,' Error When Fetch Data. '|| chr(13) || SqlErrm);
END POP_SLCT_DATA;
-----------------------------------------------------------
PROCEDURE Fetch_Slct_Itms ( SQL_CV IN OUT RCRD_CV) IS
BEGIN

    OPEN SQL_CV FOR
       SELECT R_Col1,
	      R_Col2,
	      R_Col3,
	      R_Col4,
	      R_Col5,
	      R_Col6,
	      R_Col7,
	      R_Col8,
	      R_Col9,
	      R_Col10
	      FROM TABLE(POP_SLCT_DATA) ;

   EXCEPTION
      WHEN OTHERS THEN
	 Raise_application_error(-20202,' Error When Fetch Data. '|| chr(13) || SqlErrm);
END Fetch_Slct_Itms;
End Ys_Itm_Lov_Pkg;
/
