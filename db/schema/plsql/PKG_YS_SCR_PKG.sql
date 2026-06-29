-- =============================================
-- PACKAGE SPEC: YS_SCR_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE YS_SCR_Pkg as
 Function Get_Scr_Nm	  ( P_Scr_No In FORM_DETAIL.FORM_NO%TYPE,P_Lng_no In Number Default 1 ) Return VARCHAR2;
 Function Get_Scr_Doc_Typ ( P_Scr_No In FORM_DETAIL.FORM_NO%TYPE ) Return NUMBER;
 Function Get_Scr_Parent_No ( P_Scr_No In Form_Detail.Form_No%Type  ) Return Number ;
 Function Get_Scr_Rprt_Frm_No ( P_Scr_No In FORM_DETAIL.FORM_NO%TYPE ) Return NUMBER;
 Function Get_Scr_Orgnl ( P_Scr_No In FORM_DETAIL.FORM_NO%TYPE ) Return NUMBER ;
 Function Get_Scr_Apprvd_Flg ( P_Doc_Typ In Form_Detail.Doc_Typ%Type ) Return Number;
 Function Get_Scr_Pst_Flg ( P_Doc_Typ In Form_Detail.Doc_Typ%Type ) Return Number;
 Function Get_Scr_Audit_Flg ( P_Doc_Typ In Form_Detail.Doc_Typ%Type ) Return Number;

End YS_SCR_Pkg ;
/

-- ---------------------------------------------
-- PACKAGE BODY: YS_SCR_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY  YS_SCR_Pkg as

--##------------------------------------------------------------------------------------------##--
FUNCTION Get_Scr_Nm ( P_Scr_No In FORM_DETAIL.FORM_NO%TYPE,P_Lng_no In Number Default 1 ) Return VARCHAR2 Is
 v_Scr_Nm varchar2(100);
BEGIN
 Select Form_Name
   Into v_Scr_Nm
   From Ias_Form_Name
  Where Lang_no = p_Lng_no
    and Form_no=P_Scr_No
    and RowNum<=1;

   Return(v_Scr_Nm);
 Exception When Others Then
   Return(Null);
END Get_Scr_Nm;
--##------------------------------------------------------------------------------------------##--
FUNCTION Get_Scr_Doc_Typ ( P_Scr_No In FORM_DETAIL.FORM_NO%TYPE ) Return NUMBER Is
 v_doc_typ  number;
BEGIN
 Select Doc_Typ
   Into v_doc_typ
   From Form_Detail
  Where Form_no=P_Scr_No
    and RowNum<=1;

   Return(v_doc_typ);
 Exception When Others Then
   Return(Null);
END Get_Scr_Doc_Typ;


--##------------------------------------------------------------------------------------------##--
Function Get_Scr_Parent_No ( P_Scr_No In Form_Detail.Form_No%Type  ) Return Number Is
 V_Parent_No Number;
Begin
 Select F_Parent_No
   Into V_Parent_No
   From Form_Detail
  Where  Form_No  = P_Scr_No
    And Rownum<=1;

   Return(V_Parent_No);
 Exception When Others Then
   Return(Null);
End Get_Scr_Parent_No;
--##------------------------------------------------------------------------------------------##--
FUNCTION Get_Scr_Rprt_Frm_No ( P_Scr_No In FORM_DETAIL.FORM_NO%TYPE ) Return NUMBER Is
 V_Rprt_Form_No  number;
BEGIN
 Select Rprt_Form_No
   Into V_Rprt_Form_No
   From Form_Detail
  Where Form_no=P_Scr_No
    and RowNum<=1;

   Return(V_Rprt_Form_No);
 Exception When Others Then
   Return(Null);
END Get_Scr_Rprt_Frm_No;
--##------------------------------------------------------------------------------------------##--
FUNCTION Get_Scr_Orgnl ( P_Scr_No In FORM_DETAIL.FORM_NO%TYPE ) Return NUMBER Is
 v_scr_orgnl  number;
BEGIN
 Select scr_orgnl
   Into v_scr_orgnl
   From Form_Detail
  Where Form_no=P_Scr_No
    and RowNum<=1;
   Return(v_scr_orgnl);
 Exception When Others Then
   Return(Null);
END Get_Scr_Orgnl;
--##------------------------------------------------------------------------------------------##--
Function Get_Scr_Apprvd_Flg ( P_Doc_Typ In Form_Detail.Doc_Typ%Type ) Return Number Is
 V_Doc_Apprvd_Flg  Number;
Begin
 Select Nvl(Doc_Apprvd_Flg,0)
   Into V_Doc_Apprvd_Flg
   From Gnr_Ddc_Tbl
  Where Doc_Typ=P_Doc_Typ
    And Rownum<=1;

   Return(V_Doc_Apprvd_Flg);
 Exception When Others Then
   Return(0);
End Get_Scr_Apprvd_Flg;
--##------------------------------------------------------------------------------------------##--
Function Get_Scr_Pst_Flg ( P_Doc_Typ In Form_Detail.Doc_Typ%Type ) Return Number Is
 V_Doc_Pst  Number;
Begin
 Select Nvl(Doc_Pst,0)
   Into V_Doc_Pst
   From Gnr_Ddc_Tbl
  Where Doc_Typ=P_Doc_Typ
    And Rownum<=1;

   Return(V_Doc_Pst);
 Exception When Others Then
   Return(0);
End Get_Scr_Pst_Flg;
--##------------------------------------------------------------------------------------------##--
Function Get_Scr_Audit_Flg ( P_Doc_Typ In Form_Detail.Doc_Typ%Type ) Return Number Is
 V_Audit_Flg  Number;
Begin
 Select Nvl(Audit_Flg,0)
   Into V_Audit_Flg
   From Gnr_Ddc_Tbl
  Where Doc_Typ=P_Doc_Typ
    And Rownum<=1;

   Return(V_Audit_Flg);
 Exception When Others Then
   Return(0);
End Get_Scr_Audit_Flg;
--##------------------------------------------------------------------------------------------##--
End YS_SCR_Pkg;
/
