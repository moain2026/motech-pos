-- =============================================
-- PACKAGE SPEC: IAS_CSHBNK_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE IAS_CshBnk_Pkg as
 FUNCTION Get_CB_Name (P_Cb_Type In Number,P_Cb_No  In Number,P_Lng_no In Number)   RETURN VARCHAR2;
 FUNCTION Get_CB_No_By_Nm (P_Cb_Type In Number,P_cb_nm In ACCOUNT.A_NAME%TYPE) RETURN VARCHAR2;
 FUNCTION Get_A_code  (P_Cb_Type In Number,P_Cb_No  In Number) RETURN VARCHAR2;
 FUNCTION Check_Acy   (P_Cb_Type In Number,P_Cb_No  In Number,P_a_cy   In VARCHAR2) RETURN Number;
 FUNCTION Get_CB_Ser  (P_Cb_Type In Number,P_Cb_No  In Number) RETURN Number;
 FUNCTION Get_Csh_Type(P_Csh_No  In CASH_IN_HAND.CASH_NO%TYPE) RETURN Number;
 FUNCTION Get_CB_No   (P_Cb_Type In Number , P_a_code ACCOUNT.A_CODE%TYPE, P_Acy In EX_RATE.CUR_CODE%TYPE DEFAULT NULL) RETURN NUMBER;
 FUNCTION Check_Mediator_Bnk (P_Cb_No  In Number) RETURN Number;
 FUNCTION Chk_Ac_Csh_Bnk (P_a_code ACCOUNT.A_CODE%TYPE) RETURN NUMBER;
 FUNCTION Get_Cnt_Acy (P_Cb_Type In Number ,P_Cb_No  In Number,P_Usr_No   In Number) RETURN NUMBER;
 FUNCTION Get_One_Acy_Cb (P_Cb_Type In Number ,P_Cb_No	In Number,P_Usr_no In Number) RETURN VARCHAR2;

 FUNCTION  Get_CB_Brn  (P_Cb_Type In Number ,P_Cb_No  In Number) RETURN NUMBER;
 FUNCTION  Chk_CB_Brn  (P_Cb_Type In Number ,P_Cb_No  In Number,P_Brn_no In Number) RETURN NUMBER;
 FUNCTION  GET_USR_CSH_NO(P_USR_NO IN NUMBER, P_MCHN_NO IN NUMBER)   RETURN NUMBER;
End IAS_CshBnk_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_CSHBNK_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE Body IAS_CshBnk_Pkg as
--================================================================
FUNCTION Get_CB_Name (P_Cb_Type In Number,P_Cb_No In Number,P_Lng_no In Number) RETURN VARCHAR2 Is
  v_name varchar2(60);
 Begin
	 If P_Cb_Type = 1 Then -- Cash
			 Select Decode(P_Lng_no,1,CASH_NAME,nvl(CASH_E_NAME,CASH_NAME))
			   Into v_name
			   From Cash_In_hand
			  where Cash_no=P_Cb_No ;
   ElsIf P_Cb_Type = 2 Then --	Bank
       Select Decode(P_Lng_no,1,BANK_NAME,nvl(BANK_E_NAME,BANK_NAME))
			   Into v_name
			   From Cash_At_Bank
			  where bank_no=P_Cb_No ;
   End If;
   	
	 RETURN(v_name);
	
 Exception
	when others then
	  RETURN(Null);
End Get_CB_Name ;
--===============================================================
FUNCTION Get_CB_No_By_Nm (P_Cb_Type In Number,P_cb_nm In ACCOUNT.A_NAME%TYPE) RETURN VARCHAR2 Is
  v_cb_no  NUMBER(15);
 Begin
  IF P_Cb_Type = 1 THEN	
     select Cash_no
	   Into v_cb_no
	    From Cash_In_hand
	  where (cash_name = P_cb_nm or cash_e_name =P_cb_nm )
	and Rownum<=1;
  ELSE

     select Bank_no
	   Into v_cb_no
	    From Cash_At_Bank
	  where (bank_name = P_cb_nm or bank_e_name =P_cb_nm )
	and Rownum<=1;

   END IF;
	
	 RETURN(v_cb_no);
	
 Exception
	when others then
	  RETURN(Null);
End Get_CB_No_By_Nm ;

--===============================================================
FUNCTION Check_Acy (P_Cb_Type In Number,P_Cb_No In Number,P_a_cy   In VARCHAR2) RETURN Number Is
cnt Number;
 Begin
	 If P_Cb_Type = 1 Then --  Cash
		 Select 1
		   Into cnt
		   From Ias_Cash_In_Hand_Dtl
		  where Cash_no=P_Cb_No
		    and a_cy   =P_a_cy
		    and RowNum<=1;
		
  ElsIf P_Cb_Type = 2 Then --  Bank
  	 Select 1
		   Into cnt
		   From Ias_Cash_At_Bank_Dtl
		  where Bank_no=P_Cb_No
		    and a_cy   =P_a_cy
		    and RowNum<=1;
  End If;
  	
	 RETURN(cnt);
	
 Exception
	when others then
	  RETURN(0);
End Check_Acy ;
--===============================================================
FUNCTION Get_CB_Ser (P_Cb_Type In Number,P_Cb_No  In Number) RETURN Number Is
 v_sr Number;
Begin
 If P_Cb_Type = 1 Then -- Cash
	  Select nvl(cash_sr,0)
	    Into v_sr
	    From Cash_in_Hand
		 where Cash_no=P_Cb_No;
 ElsIf P_Cb_Type = 2 Then -- Bank
	  Select nvl(Bank_sr,0)
	    Into v_sr
	    From Cash_at_bank
		 where Bank_no=P_Cb_No;
 End If;
 	
 RETURN(v_sr);

 Exception
  When Others Then
   RETURN(Null);
End Get_CB_Ser;
--===============================================================
FUNCTION Get_A_code  (P_Cb_Type In Number,P_Cb_No  In Number) RETURN VARCHAR2 Is
 v_a_code Number;
Begin
 If P_Cb_Type = 1 Then -- Cash
	  Select A_code
	    Into v_a_code
	    From Cash_in_Hand
		 where Cash_no=P_Cb_No;
 ElsIf P_Cb_Type = 2 Then -- Bank
	  Select A_code
	    Into v_a_code
	    From Cash_at_bank
		 where Bank_no=P_Cb_No;
 End If;
 	
 RETURN(v_a_code);

 Exception
  When Others Then
   RETURN(Null);
End Get_A_code;
--===============================================================
FUNCTION Get_Csh_Type(P_Csh_No In CASH_IN_HAND.CASH_NO%TYPE) RETURN Number Is
v_csh_type  Number;
Begin

  Select Cash_Type
    Into v_csh_type
    From Cash_in_Hand
	 where Cash_no=P_Csh_No;

 RETURN(v_csh_type);

 Exception
  When Others Then
   RETURN(Null);
End Get_Csh_Type;
--===============================================================
FUNCTION Get_CB_No (P_Cb_Type In Number , P_a_code ACCOUNT.A_CODE%TYPE , P_Acy In EX_RATE.CUR_CODE%TYPE DEFAULT NULL) RETURN NUMBER Is
    v_cb_no   Number;

  Begin

	 If P_Cb_Type = 1 Then -- Cash
	      Select Cash_No
		Into v_cb_no
		From Cash_in_Hand
		 Where A_code = P_a_code;
	 ElsIf P_Cb_Type = 2 Then -- Bank
	      Select Bank_No
		Into v_cb_no
		From Cash_at_Bank
		 Where A_code = P_a_code;
	 End If;

 	 RETURN(v_cb_no);

 Exception
  When Others Then
   If P_Acy Is not Null Then
		   Begin
			   If P_Cb_Type = 1 Then -- Cash
				      Select Cash_no
					Into v_cb_no
					From Ias_Cash_in_Hand_Dtl
				       Where A_code = P_a_code
					 and A_cy = P_Acy;
				 ElsIf P_Cb_Type = 2 Then -- Bank
				      Select Bank_no
					Into v_cb_no
					From Ias_Cash_at_Bank_Dtl
				       Where A_code = P_a_code
					 and A_cy = P_Acy;
				 End If;
			
		 	 	 RETURN(v_cb_no);
		
		   Exception
		    When Others Then
		       RETURN(Null);
 		   End;
   Else
  	    RETURN(Null);
 	 End If;
End Get_CB_No;
--===============================================================
FUNCTION Check_Mediator_Bnk (P_Cb_No  In Number) RETURN Number Is
 v_md  Number:=0;
Begin
 If P_Cb_No Is Not Null Then
	  Select nvl(MEDIATOR,0)
	    Into v_md
	    From Cash_At_Bank
		 where Bank_no = P_Cb_No
		   and RowNum<=1;
 End If;
 	
 RETURN(v_md);

 Exception
  When Others Then
   RETURN(0);
End Check_Mediator_Bnk;
--===============================================================
FUNCTION Chk_Ac_Csh_Bnk (P_a_code ACCOUNT.A_CODE%TYPE) RETURN NUMBER Is
 Cnt   NUMBER;
 v_typ NUMBER;
BEGIN
--v_typ = 1 Cash
--v_typ = 2 Bank

If P_a_code Is Not Null Then --(1)

 Begin
  Select 1 Into Cnt From Cash_in_Hand
   Where a_code =P_a_code
     and RowNum<=1;

   Exception
   When No_Data_Found Then
    Cnt:=0;
   When Others Then
    Cnt:=0;
  End;

    If Cnt = 0 Then
	   Begin
  	     Select 1 Into Cnt From Cash_At_Bank
	      Where a_code =P_a_code
		and RowNum<=1;
		 Exception
		When No_Data_Found Then
	      Cnt:=0;
		When Others Then
	  Cnt:=0;
	   End;
	
	   If Cnt>0   Then
    	  v_typ:=2; -- bank
     Else
	v_typ:=0;-- No
	   End If;
	Else
	v_typ:=1; -- cash  	 		
	End If; 	

  Return(v_typ);

End If; --(1)
END Chk_Ac_Csh_Bnk;
--===============================================================
 FUNCTION Get_Cnt_Acy (P_Cb_Type In Number ,P_Cb_No  In Number,P_Usr_No   In Number) RETURN NUMBER Is

  cnt	Number;
Begin
    If P_Cb_Type = 1 Then
	Begin
		Select count(*)
			Into Cnt
			From IAS_CASH_IN_HAND_DTL
		Where Cash_No =P_Cb_No
		And   A_Cy   In (Select A_Cy
				  From	 Priv_Cash
				  Where  Cash_Type=P_Cb_Type
				  And	U_Id  = P_Usr_No
				  And	Cash_No= P_Cb_No  And Add_Flag=1);
	Exception When Others Then
	    Cnt := 0;
	End;   		
    ElsIf P_Cb_Type = 2 Then
	Begin
		Select count(*)
			Into Cnt
			From IAS_CASH_AT_BANK_DTL
		Where Bank_No =P_Cb_No
		And   A_Cy   In (Select A_Cy
				  From	 Priv_Cash
				  Where  Cash_Type=P_Cb_Type
				  And	U_Id  = P_Usr_No
				  And	Cash_No= P_Cb_No  And Add_Flag=1);
	Exception When Others Then
	    Cnt := 0;
	End;   		
	End If;
	RETURN(Cnt);
	
 Exception
	When others then
	  RETURN(Null);
End Get_Cnt_Acy ;
--================================================================
 FUNCTION Get_One_Acy_Cb (P_Cb_Type In Number ,P_Cb_No	In Number,P_Usr_no In Number) RETURN VARCHAR2 IS

  v_Acy varchar2(7);
Begin

    Begin
   	    Select A_Cy
   	      Into v_Acy
	  From Priv_Cash
	 Where Cash_Type=P_Cb_Type
	   And U_Id  = P_Usr_No
	   And Cash_No= P_Cb_No  And Add_Flag=1 ;
    Exception
      When Others Then
   	    Null;
    End;

    RETURN(v_Acy);
	
 Exception
	When others then
	  RETURN(Null);
End Get_One_Acy_Cb ;
--===================================================================
FUNCTION  Get_CB_Brn  (P_Cb_Type In Number ,P_Cb_No  In Number) RETURN NUMBER Is
  v_brn Number;
Begin

	If P_Cb_Type = 1 Then
	   Select conn_brn_no
		   Into v_brn
		   From cash_in_hand
		  where cash_no = P_Cb_No
		    and RowNum<=1;
	ElsIf P_Cb_Type = 2 Then
	
	   Select conn_brn_no
		   Into v_brn
		   From cash_at_bank
		  where bank_no = P_Cb_No
		    and RowNum<=1;
	End If;
	Return(v_brn);
 Exception
	when others then
	  Return(0);
End Get_CB_Brn ;
--===============================================================
FUNCTION  Chk_CB_Brn  (P_Cb_Type In Number ,P_Cb_No  In Number,P_Brn_no In Number) RETURN NUMBER Is
  v_cnt Number:=0;
Begin

	If P_Cb_Type = 1 Then
		
	   Select 1
		   Into v_cnt
		   From cash_in_hand
		  where cash_no = P_Cb_No
	      and conn_brn_no = P_Brn_no
		    and RowNum<=1;
	ElsIf P_Cb_Type = 2 Then
	
	   Select 1
		   Into v_cnt
		   From cash_at_bank
		  where bank_no = P_Cb_No
	      and conn_brn_no = P_Brn_no
		    and RowNum<=1;
	End If;
	Return(v_cnt);
	
 Exception
	when others then
	  Return(0);
End Chk_CB_Brn ;
--===============================================================
FUNCTION  GET_USR_CSH_NO(P_USR_NO IN NUMBER, P_MCHN_NO IN NUMBER)   RETURN NUMBER
IS
 V_CASH_NO CASH_IN_HAND.CASH_NO%TYPE;
BEGIN
   BEGIN
    SELECT CASH_NO
      INTO V_CASH_NO
      FROM USER_R
     WHERE U_ID = P_USR_NO AND CASH_NO IS NOT NULL AND ROWNUM = 1;
   EXCEPTION
	WHEN NO_DATA_FOUND THEN
	    BEGIN
		SELECT CASH_NO_CNCT
		  INTO V_CASH_NO
		  FROM IAS_POS_MACHINE
		 WHERE MACHINE_NO=P_MCHN_NO AND CASH_NO_CNCT IS NOT NULL AND ROWNUM = 1;
	    EXCEPTION
		WHEN OTHERS THEN
		    RAISE_APPLICATION_ERROR(-20004, 'Error When Get Cash_No For Casher= ' || P_USR_NO || CHR(13) || SQLERRM);
	    END;
   END;
   RETURN(V_CASH_NO);
EXCEPTION    WHEN OTHERS THEN
     RETURN(NULL);
     --RAISE_APPLICATION_ERROR(-20005, 'Error In Get_Usr_Csh_No ' || SQLERRM);
END GET_USR_CSH_NO;
--===============================================================
End IAS_CshBnk_Pkg;
/
