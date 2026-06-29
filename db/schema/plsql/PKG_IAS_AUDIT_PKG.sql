-- =============================================
-- PACKAGE SPEC: IAS_AUDIT_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
PACKAGE IAS_AUDIT_PKG AS
--==============================================================================
PROCEDURE Aud_Rprt ( P_Form_No	  IN NUMBER   ,
		     P_Rep_Nm	  IN VARCHAR2 ,
		     P_Rep_Whr	  IN VARCHAR2 ,
		     P_Rep_Whr1   IN VARCHAR2 ,
		     P_Rep_Title  IN VARCHAR2 ,
		     P_Aud_U_Id   IN NUMBER   ,
		     P_Trmnl_Name IN VARCHAR2 ,
		     P_Cmp_No	  IN NUMBER   ,
		     P_Brn_No	  IN NUMBER   ,
		     P_Brn_Usr	  IN NUMBER   ,
		     P_Brn_Year   IN NUMBER   ,
		     P_Doc_Typ	  In Number Default Null,
		     P_Doc_No	  In Number Default Null,
		     P_Doc_Srl	  In Number Default Null,
		     P_Doc_Date   In Date   Default Null);
--==============================================================================
End IAS_AUDIT_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_AUDIT_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE Body IAS_AUDIT_PKG AS
--======================================================
PROCEDURE Aud_Rprt ( P_Form_No	  IN NUMBER   ,
		     P_Rep_Nm	  IN VARCHAR2 ,
		     P_Rep_Whr	  IN VARCHAR2 ,
		     P_Rep_Whr1   IN VARCHAR2 ,
		     P_Rep_Title  IN VARCHAR2 ,
		     P_Aud_U_Id   IN NUMBER   ,
		     P_Trmnl_Name IN VARCHAR2 ,
		     P_Cmp_No	  IN NUMBER   ,
		     P_Brn_No	  IN NUMBER   ,
		     P_Brn_Usr	  IN NUMBER   ,
		     P_Brn_Year   IN NUMBER   ,
		     P_Doc_Typ	  In Number Default Null,
		     P_Doc_No	  In Number Default Null,
		     P_Doc_Srl	  In Number Default Null,
		     P_Doc_Date   In Date   Default Null   ) Is
Begin

      If P_Form_No Is Not Null And P_Rep_Nm Is Not Null Then

	Insert Into Ias_Aud_Prnt_Rep ( Form_No,
				       Rep_Nm,
				       Rep_Title,
				       Rep_Whr,
				       Rep_Whr1,
				       Aud_U_Id,
				       Aud_Date,
				       Trmnl_Name,
				       Cmp_No,
				       Brn_No,
				       Brn_Usr,
				       Brn_Year,
				       Doc_Typ,
				       Doc_No,
				       Doc_Srl,
				       Doc_Date)
			      Values ( P_Form_No,
				       P_Rep_Nm,
				       P_Rep_Title,
				       P_Rep_Whr,
				       P_Rep_Whr1,
				       P_Aud_U_Id,
				       Ias_Gen_Pkg.Get_Curdate,
				       P_Trmnl_Name,
				       P_Cmp_No,
				       P_Brn_No,
				       P_Brn_Usr,
				       P_Brn_Year,
				       P_Doc_Typ,
				       P_Doc_No,
				       P_Doc_Srl,
				       P_Doc_Date);

	 Commit;
      End If;

  Exception When Others Then
      Null;
End Aud_Rprt ;
--==========================================================
End IAS_AUDIT_PKG;
/
