-- =============================================
-- PACKAGE SPEC: IAS_CHECK_SYS_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
Package IAS_Check_Sys_Pkg Is
  User_Id   pls_integer;
  Lng_no    pls_integer := 1;
  cnt	   	Number;

  PROCEDURE Set_Sys_Prmtrs ( Lang_no In NUMBER ,U_id In NUMBER);

  Function Check_Cur_Rate(P_Accur     In Varchar2	      ,
			  P_Acrate    In Number 	      ,
			  P_Local_Cur In Varchar2	      ,
			  P_Rate_Type In Number Default 0     ,
			  P_Date      In Date	Default  Null ) Return Number ;
  PROCEDURE Check_Date ( P_Doc_Date In Date,P_Scr_Type In Varchar2,
			 P_Frm_Type In Number Default 0,
			 P_chk_cls  In Number Default 1,
			 P_Lang_no  In Number Default 1,
			 P_Brn_No   In Number Default NULL);
  PROCEDURE Check_Bt_Date (P_Fd In Out Date,P_Td In Out Date);
  PROCEDURE Check_Bt_Value(P_FN In Out Varchar2,P_TN In Out Varchar2,P_Type In Varchar2 Default 'N');
  FUNCTION  Check_Ac_Acy_Inctv	(P_Type In varchar2,P_a_code In ACCOUNT.A_CODE%TYPE,P_acy In varchar2) RETURN NUMBER;
  FUNCTION  Check_Use_Cc	(P_a_code In ACCOUNT.A_CODE%TYPE) RETURN NUMBER ;
  FUNCTION Check_Inv_Close RETURN NUMBER;
  FUNCTION Check_Lmt_Cost_Itm ( P_Wtavg_Type In NUMBER,
				P_I_code   	 In Ias_Itm_Mst.I_CODE%TYPE,				  	
			      	P_W_code   	 In WAREHOUSE_DETAILS.W_CODE%TYPE DEFAULT NULL,
			      	P_Itm_Cost 	 In NUMBER) RETURN BOOLEAN;

End IAS_Check_Sys_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_CHECK_SYS_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
Package Body IAS_Check_Sys_Pkg Is

Procedure Set_Sys_Prmtrs ( Lang_no NUMBER ,U_id NUMBER) Is
Begin
  User_Id :=U_id;
  Lng_no  :=Lang_no;
End Set_Sys_Prmtrs;
																
--===========================================================================================================
Function Check_Cur_Rate(P_Accur     In Varchar2 	    ,
			P_Acrate    In Number		    ,
			P_Local_Cur In Varchar2 	    ,
			P_Rate_Type In Number Default 0     ,
			P_Date	    In Date   Default  Null ) Return Number Is
  V_Min_Rate Number;
  V_Max_Rate Number;
  V_Up_Date  Date  ;
  -- P_Type = 0  Get Current Rate
  -- P_Type = 1  Get Period Rate
 Begin
     If P_Accur Is Not Null And P_Accur <> P_Local_Cur Then

			Select Nvl(Min_Cur_Rate,0) ,Nvl(Max_Cur_Rate,0)
			   Into V_Min_Rate,V_Max_Rate
			 From Ex_Rate
			  Where Cur_Code = P_Accur ;
	If P_Acrate Is Not Null Then
	   If Nvl(P_Acrate,0) > Nvl(V_Max_Rate,0)  And	Nvl(V_Max_Rate,0)  > 0	Then
	      Return(2); --Message No= 593
	   Elsif Nvl(P_Acrate,0) < Nvl(V_Min_Rate,0) And Nvl(V_Min_Rate,0) > 0 Then
	      Return(3); --Message No= 594
	   Else
	      Return(1);
	   End If;
	Else
	    Return(1);
	End If;
     Else
	 Return(1);
     End If;
Exception
  When Others Then
      Raise_Application_Error(-20408,' Error When Get Limit CurrencyRate = '||Sqlerrm) ;
End Check_Cur_Rate;
--===============================================================
PROCEDURE Check_Date( P_Doc_Date In Date,
		      P_Scr_Type In Varchar2,
		      P_Frm_Type In Number Default 0,
		      P_chk_cls  In Number Default 1,
		      P_Lang_No  In Number Default 1,
		      P_Brn_No	 In Number Default NULL) IS
cnt   Number;
v_s   Number;
v_fs  Number;
sd    Date;

BEGIN
--P_Scr_Type FRM Or REP
--P_Frm_Type 0 = Not Inv Scr, 1= Inv Scr

If P_doc_date Is Not Null Then --(1)
	
  --If Upper(P_Scr_Type) In ('REP','FRM')  Then --(2)
  If Upper(P_Scr_Type) = 'FRM'	Then --(2)
    Begin
	
	     IF P_Brn_No is null then
	
	       Select nvl(INACTV,0), 0
		 Into v_s ,v_fs
		 From S_PRD_DTL
		where P_doc_date between F_date and t_date;

       ELSE
	
	       Select nvl(INACTV,0),nvl(PRD_CLS,0)
		 Into v_s ,v_fs
		 From S_PRD_BRN_CLS
		where P_doc_date between F_date and t_date
		  AND BRN_NO = P_BRN_NO;
	
	     END IF;
	
	       If v_s=1 and Upper(P_Scr_Type) = 'FRM' Then
		  Raise_application_error(-20605,ias_gen_pkg.get_msg(P_Lang_no,1096));
	       ElsIf v_fs=1 and Upper(P_Scr_Type) = 'FRM' and P_chk_cls = 1 Then
		  Raise_application_error(-20605,ias_gen_pkg.get_msg(P_Lang_no,1096));
	       End If;
	
	 /*If P_chk_cls = 1 Then
			     Begin
			       Select Status Into cnt From IAS_CLOSE_DAY_PERIODS
				where P_doc_date between f_date and t_date
				  and RowNum<=1;
			       If cnt>0 and Upper(P_Scr_Type) = 'FRM' Then
				  Raise_application_error(-20605,ias_gen_pkg.get_msg(P_Lang_no,1096));
				  --If v_fld Is Not Null Then
				    -- Copy(Null,v_fld);
				  --End if;
				 Raise_application_error(-20605,ias_gen_pkg.get_msg(P_Lang_no,1096));
			       End If;
			     Exception
			       	when no_data_found then
			       	  Null;
			     End;
	 End If;*/

	     Exception
	       when no_data_found then
		Raise_application_error(-20605,ias_gen_pkg.get_msg(P_Lang_no,9));
	   End;
  End If; --(2)


--## Date Lock

  If Upper(P_Scr_Type) = 'FRM'	Then  --(3)
     Begin

		 /*  Select Count(1) Into cnt
		    From date_lock
		    where P_doc_date between ufd and utd or P_doc_date between lfd and ltd;
	
	      If cnt>0 Then
		 Raise_application_error(-20605,ias_gen_pkg.get_msg(P_Lang_no,1096));
	      End If;
	
		
		   Select Count(1) Into cnt
		    From ias_date_lock_User
		    where u_id = User_Id
		      and (P_doc_date between ufd and utd or P_doc_date between lfd and ltd);

	      If cnt>0 then
		 Raise_application_error(-20605,ias_gen_pkg.get_msg(P_Lang_no,1096));
	      End If;
      */
--## check inv close.

      If P_Frm_Type = 1 Then
     	    Select Count(1) Into cnt
     	      From S_PRD_MST
	   where INV_CLS = 1;
			      If cnt>0 then
				 Raise_application_error(-20605,ias_gen_pkg.get_msg(P_Lang_no,1204));
			      End If;
      End If;			

--## sysdate greater then today

   /* Select Sysdate Into sd From dual;

       If P_doc_date> sd then
	  MsgBox(365);
       End If;
*/
    Exception
     when no_data_found then
       Raise_application_error(-20605,ias_gen_pkg.get_msg(P_Lang_no,9));
   End;

  End If; --(3)

End If; --(1)
End Check_Date;
--===============================================================
PROCEDURE Check_Bt_Date (P_Fd In Out Date,P_Td In Out Date) Is
 TempDate Date;
Begin
 If P_Fd Is Null and P_Td Is Not Null Then
    P_Fd:=P_Td;
 --ElsIf P_Fd Is Not Null and P_Td Is Null Then
    --P_Td:=P_Fd;
 End If;

  If P_Fd > P_Td Then
     TempDate:=P_Fd;
     P_Fd:=P_Td;
     P_Td:=TempDate;
  End if;

Exception
 When others then
  Null;
End Check_Bt_Date;
--===============================================================

PROCEDURE Check_Bt_Value (P_FN In Out Varchar2,P_TN In Out Varchar2,P_Type In Varchar2 Default 'N' ) Is
 TempNm Number;
 TempCh Varchar2(30);
Begin

If P_FN Is Null and P_TN Is Not Null Then
   P_FN:=P_TN;
--ElsIf P_FN Is Not Null and P_TN Is Null Then
  -- P_TN:=P_FN;
End If;

If Upper(P_type) = 'N' Then -- Numeric
  If To_number(P_FN) > To_number(P_TN) Then
     TempNm:=To_number(P_FN);
     P_FN:=P_TN;
     P_TN:=TempNm;
  End if;
Else -- Alph
  If P_FN > P_TN Then
     TempCh:=P_FN;
     P_FN:=P_TN;
     P_TN:=TempCh;
  End if;
End if;

Exception
 When others then
  Null;
End Check_Bt_Value;
--============================================================================
FUNCTION  Check_Ac_Acy_Inctv	(P_Type In varchar2,P_a_code In ACCOUNT.A_CODE%TYPE,P_acy In varchar2) RETURN NUMBER Is
 v_Inc Number:=0;
Begin
If P_a_code Is Not Null and P_acy Is Not Null Then
	If Upper(P_type) ='ACODE' Then
	  Select nvl(Inactive,0)
	    Into v_Inc
	    From Account_curr
	   Where a_code = P_a_code
	     and a_cy=P_acy;
	Elsif Upper(P_type) ='CCODE' Then
	  Select nvl(Inactive,0)
	    Into v_Inc
	    From customer_curr
	   Where c_code = P_a_code
	     and a_cy=P_acy;
	Elsif Upper(P_type) ='CASH' Then
	  Select nvl(Inactive,0)
	    Into v_Inc
	    From Ias_cash_in_hand_dtl
	   Where cash_no = P_a_code
	     and a_cy=P_acy;
	Elsif Upper(P_type) ='BANK' Then
	  Select nvl(Inactive,0)
	    Into v_Inc
	    From Ias_cash_at_bank_dtl
	   Where bank_no = P_a_code
	     and a_cy=P_acy;
	End if;
End If;
  Return(v_Inc);
 Exception
 When Others Then
    Return(0);
End Check_Ac_Acy_Inctv;
--=================================================================
FUNCTION  Check_Use_Cc	(P_a_code In ACCOUNT.A_CODE%TYPE) RETURN NUMBER Is
 v_Use_cc Number;
Begin
  Select nvl(Use_cc,1)
    Into v_Use_cc
    From Account
   Where a_code = P_a_code
     and RowNum<=1;

     Return(v_Use_cc);
 Exception When Others Then
    Return(1);
End Check_Use_Cc;
--===========================================================================
FUNCTION Check_Inv_Close RETURN NUMBER Is
cnt Number;
Begin

  Select 1 Into cnt From S_PRD_MST
   Where inv_cls = 1
     and RowNum<=1;

    Return(cnt);

 Exception
  when others then
    Return(0);
End Check_Inv_Close;
--===========================================================================
Function Check_Lmt_Cost_Itm ( P_Wtavg_Type In Number,
			      P_I_Code	       In Ias_Itm_Mst.I_Code%Type,
			      P_W_Code	     In Warehouse_Details.W_Code%Type Default Null,
			      P_Itm_Cost      In Number) Return Boolean Is
     V_Cnt	   Number;
Begin

  If P_Wtavg_Type = 1 Then  -- By Items

	  Select 1
	    Into Cnt
	    From Ias_Itm_Mst
	   Where I_Code =P_I_Code
	     And (Nvl(P_Itm_Cost,0) >= Nvl(I_Cwtavg,0) - (Nvl(I_Cwtavg,0) * Nvl(Min_Lmt_Cost_Per,0))/100 Or Min_Lmt_Cost_Per Is Null)
	     And (Nvl(P_Itm_Cost,0) <= Nvl(I_Cwtavg,0) + (Nvl(I_Cwtavg,0) * Nvl(Max_Lmt_Cost_Per,0))/100 Or Max_Lmt_Cost_Per Is Null Or Nvl(I_Cwtavg,0) = 0)
	     And Rownum<=1;

	     Return TRUE;

 Elsif P_Wtavg_Type In (2,3) And P_W_Code Is Not Null Then  -- By Items + W_code
	      Begin
	       Select 1
		    Into V_Cnt
		    From Ias_Itm_Wcode
		   Where I_Code =P_I_Code
		     And W_Code = P_W_Code
		     And Rownum<=1;
	       Exception
		 When Others Then
		 V_Cnt:=0;
	      End;
	      If      Nvl(V_Cnt,0)>0 Then
		      /*Select 1
			Into V_cnt
			From Ias_Itm_Wcode
		       Where i_code =P_I_Code
			 and w_code = P_W_code
			 And (Nvl(P_Itm_Cost,0) >= Nvl(I_cwtavg,0) - (Nvl(I_cwtavg,0) * Nvl(MIN_LMT_COST_PER,0))/100 Or MIN_LMT_COST_PER Is Null)
			 And (Nvl(P_Itm_Cost,0) <= Nvl(I_cwtavg,0) + (Nvl(I_cwtavg,0) * Nvl(MAX_LMT_COST_PER,0))/100 Or MAX_LMT_COST_PER Is Null Or Nvl(I_cwtavg,0) = 0)
			 And RowNum<=1;*/

			  Select 1
			    Into V_Cnt
			    From Ias_Itm_Wcode ,Ias_Itm_Mst
			   Where Ias_Itm_Mst.I_Code=Ias_Itm_Wcode.I_Code
			     And Ias_Itm_Mst.I_Code =P_I_Code
			     And W_Code = P_W_Code
			     And (Nvl(P_Itm_Cost,0) >= Nvl(Ias_Itm_Wcode.I_Cwtavg,0) - (Nvl(Ias_Itm_Wcode.I_Cwtavg,0) * Nvl(Ias_Itm_Mst.Min_Lmt_Cost_Per,0))/100 Or Ias_Itm_Mst.Min_Lmt_Cost_Per Is Null)
			     And (Nvl(P_Itm_Cost,0) <= Nvl(Ias_Itm_Wcode.I_Cwtavg,0) + (Nvl(Ias_Itm_Wcode.I_Cwtavg,0) * Nvl(Ias_Itm_Mst.Max_Lmt_Cost_Per,0))/100 Or Ias_Itm_Mst.Max_Lmt_Cost_Per Is Null Or Nvl(Ias_Itm_Wcode.I_Cwtavg,0) = 0)
			     And Rownum<=1;

		 Return TRUE;
	      ELSE
		 Return TRUE;
	      End If;

  Else
      Return TRUE;
  End If;

Exception
  When Others Then
     Return FALSE;
End Check_Lmt_Cost_Itm ;
--================================== End Pkg ====================================
End IAS_Check_Sys_Pkg ;
/
