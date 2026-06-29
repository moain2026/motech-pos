-- =============================================
-- PACKAGE SPEC: IAS_GEN_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
Package IAS_Gen_Pkg as
  FUNCTION order_by_name(p_icode in Ias_Itm_Mst.I_CODE%TYPE) RETURN VARCHAR2 ;
  Pragma restrict_references(order_by_name,WNDs,WNPS);
  FUNCTION LF(p_curr In VARCHAR2 ) RETURN NUMBER;
  Pragma restrict_references(LF,WNDs,WNPS);
  FUNCTION Get_Cnt (SqlStr VARCHAR2)  RETURN NUMBER;
  FUNCTION Get_CurNo (P_Acy In Varchar2)   RETURN NUMBER;
  FUNCTION Get_Frst_Day RETURN DATE;
  FUNCTION Get_Final_Day RETURN DATE;
  FUNCTION Get_Sysdate	RETURN DATE ;
  FUNCTION Get_Curdate	RETURN DATE ;
  FUNCTION Get_Local_Cur  RETURN VARCHAR2 ;
  FUNCTION Get_Stk_Cur	 RETURN VARCHAR2 ;
  Function Get_Cur_Rate (P_Acy	     In Varchar2	     ,
			 P_Rate_Type In Number Default	0    ,
			 P_Date      In Date   Default	Null ) Return Number ;
  FUNCTION Get_Lev_Prv (P_UserNo In Number,P_Icode Varchar2 Default Null,P_Price_Type Number Default Null,P_Wcode Number Default Null,P_Brn_No Number Default Null) RETURN NUMBER ;
	FUNCTION Get_Lev_Dflt_Prv (P_UserNo In Number,P_Icode Varchar2 Default Null,P_Price_Type Number Default Null,P_Wcode Number Default Null,P_Brn_No Number Default Null) RETURN NUMBER ;
  FUNCTION Get_Frm_Prv (P_UserNo In Number , P_Frm_no In Number)  RETURN NUMBER ;
  FUNCTION Get_One_Wcode RETURN NUMBER ;
	Function Get_Itm_Price_Docacy ( P_Icode 		       In Ias_Itm_Mst.I_Code%Type,
				P_Itm_Unt		       In Ias_Itm_Dtl.Itm_Unt%Type,
				P_Acy			       In Varchar2,
				P_Loc_Cur		       In Varchar2,
				P_Stk_Cur		       In Varchar2,
				P_Ac_Rate		       In Number,
				P_Stk_Rate		       In Number,
				P_Lev_No	  		   In Number,
				P_Wcode 		       In Number    Default Null,
				P_Iqty			       In Number    Default Null,
				P_Bill_Doc_Type 	       In Number    Default Null,
				P_Price_Type		       In Number    Default 1 ,
				P_Brn_No		       In Number    Default Null,
				P_Exp_Date		       In Date	    Default Null,
				P_Batch_No		       In Varchar2  Default Null,
				P_Use_Price_Exp_Date	       In Number    Default 0,
				P_Use_Price_Batch_No	       In Number    Default 0,
				P_Use_Exp_Date		       In Number    Default 0,
				P_Use_Batch_No		       In Number    Default 0,
				P_Itm_Use_Price_ExpDate_Optnl  In Number    Default 0,
				P_Itm_Use_Price_BtchNo_Optnl   In Number    Default 0) Return Number ;
  FUNCTION Get_Low_Price(P_Icode    In Ias_Itm_Mst.I_CODE%TYPE,
			 P_Itm_Unt  In Ias_Itm_DTL.ITM_UNT%TYPE,
			 P_acy	    In Varchar2,
			 P_loc_cur  In Varchar2,
			 P_Stk_cur  In Varchar2,
			 P_ac_rate  In Number,
			 P_Stk_Rate In Number,
			 P_Price_Type In Number DEFAULT NULL,
			 P_W_CODE   In Number DEFAULT NULL,
			 P_QTY	    IN NUMBER DEFAULT NULL ) RETURN NUMBER;
-----------------------------------------------------------------------------------------------------------
  FUNCTION Get_High_Price(P_Icode    In Ias_Itm_Mst.I_CODE%TYPE,
			  P_Itm_Unt In Ias_Itm_DTL.ITM_UNT%TYPE,
  					  P_acy      In Varchar2,
  					  P_loc_cur  In Varchar2,
			    P_Stk_cur  In Varchar2,
			    P_ac_rate  In Number,
			    P_Stk_Rate In Number,
			    P_Price_Type In Number DEFAULT NULL,
			    P_W_CODE   In Number DEFAULT NULL,
			    P_QTY      IN NUMBER DEFAULT NULL ) RETURN NUMBER ;

  FUNCTION Get_Itm_Price ( P_LevNo    In Number,
													 P_Icode    In Ias_Itm_Mst.I_CODE%TYPE,
													 P_Itm_Unt  In Ias_Itm_DTL.ITM_UNT%TYPE,
				       P_acy 	    In varchar2 ,
				       P_billrate In Number,
				       P_c_code   In CUSTOMER.C_CODE%TYPE Default Null,
				       P_w_code   In WAREHOUSE_DETAILS.W_CODE%TYPE   Default Null,
									   P_Frc_no   In Number   Default 2 ) Return Number ;
  PROCEDURE Get_Fields (P_IAS_User In varchar2,P_Tab_Nm In Varchar2 ,P_WHR In varchar2 Default Null) ;
  FUNCTION  Get_Fld_Value (P_Tab_Nm In Varchar2 ,P_Fld_Nm In Varchar2,P_WHR In varchar2 Default Null)  RETURN VARCHAR2 ;
  FUNCTION  Get_Flg_Nm (P_flg_code In varchar2,P_flg_value In Number,P_Lng_no In Number Default 1)  RETURN VARCHAR2;
  FUNCTION  Get_Prompt (P_Lng_no In number ,P_Lbl_no  In Number) RETURN CHAR;
  FUNCTION  Get_Msg	   (P_Lng_no In number ,P_Msg_no In Number) RETURN CHAR;
  FUNCTION  Get_Brn_Nm (P_Brn_No In Number,P_Lng_no In Number Default 1)  RETURN VARCHAR2;
  FUNCTION  Get_Frm_Nm (P_Frm_No In Number,P_Lng_no In Number Default 1)  RETURN VARCHAR2;
  FUNCTION  Get_Usr_Nm (P_Usr_No In Number,P_Lng_no In Number Default 1)  RETURN VARCHAR2;
  FUNCTION  Get_Usr_Adm (P_Usr_No In Number)  RETURN NUMBER;
  FUNCTION  Get_Usr_Apprv ( P_Usr_No In Number ,
							  P_Frm_No In Number ,
							  P_Tab_Nm In Varchar2,
							  P_Fld_Nm In Varchar2)  RETURN NUMBER;
  FUNCTION  Get_Delete_Doc_Period (P_UserNo  In Number ,
				   P_Ad_Date In Date   )  RETURN NUMBER ;
  FUNCTION  Get_Update_Doc_Period (P_UserNo  In Number ,
				   P_Ad_Date In Date   )  RETURN NUMBER;
  FUNCTION Get_Low_Lvl_Price ( P_Usr_No In User_R.U_Id%Type  ) RETURN NUMBER;
  FUNCTION Get_High_Lvl_Price ( P_Usr_No In User_R.U_Id%Type  ) RETURN NUMBER;
End IAS_Gen_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_GEN_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
Package Body IAS_Gen_Pkg as
 Function  order_by_name(p_icode In Ias_Itm_Mst.I_CODE%TYPE) return VARCHAR2 Is
   cursor nam is select i_name From Ias_Itm_Mst
	 where i_code=p_icode ;
    rslt VARCHAR2(100):='';
 Begin
  open nam ;
  fetch nam  into rslt ;
  close nam;
  return rslt;
 exception
 when others then
  return ('');
  close nam ;
 End ;
--======================================================================================
FUNCTION LF(p_curr In VARCHAR2 ) RETURN NUMBER Is
 L  NUMBER;
Begin
  Select l_f Into L From Ex_Rate Where cur_code = p_curr ;
  Return L ;
Exception
When Others then
 return Null;
END LF;

--======================================================================================

FUNCTION Get_Cnt (SqlStr VARCHAR2)  RETURN NUMBER IS
 Val NUMBER;
Begin

Execute Immediate SqlStr Into Val;
 RETURN Val;

 Exception
  When No_Data_Found Then
   RETURN 0;
  When Others Then
   Raise_ApplICation_Error(-20406,'Error  Get_Cnt ' || '' || SqlErrm);
End Get_Cnt;

--===========================================================================================
FUNCTION Get_CurNo (P_Acy In Varchar2)	 RETURN NUMBER Is
 v_CurNo Number;
Begin
  Select Cur_no
    Into v_CurNo
    From Ex_Rate
   Where Cur_Code=P_Acy;

   Return(v_CurNo);

 Exception
  When Others Then
   Return(Null);
End Get_CurNo;
--===========================================================================================
FUNCTION Get_Frst_Day RETURN DATE Is
 v_frst_day Date;
Begin
  Select Min(F_date) --to_char(Min(From_date),'DD/MM/YYYY')
    Into v_frst_day
    From S_PRD_DTL;

  Return(v_frst_day);


 Exception
  When Others Then
      Begin
	      Select F_date
		Into v_frst_day
		From S_PRD_DTL
	       where PRD_NO=1;

	  Return(v_frst_day);
	Exception
	When Others Then
	 Return(Null);
      End;

End Get_Frst_Day;
--========================================================================================

FUNCTION Get_Final_Day RETURN DATE Is
 v_fnal_day Date;
Begin
  Select Max(T_date) --to_char(Min(From_date),'DD/MM/YYYY')
    Into v_fnal_day
    From S_PRD_DTL;

  Return(v_fnal_day);


 Exception
  When Others Then
      Begin
	      Select T_date
		Into v_fnal_day
		From S_PRD_DTL
	       where PRD_NO=( Select max(PRD_NO) From S_PRD_DTL );

	  Return(v_fnal_day);
	Exception
	When Others Then
	 Return(Null);
      End;

End Get_Final_Day;

--===========================================================================================
FUNCTION Get_Sysdate  RETURN DATE Is
 S_SysDate Date;
Begin
  Select Sysdate
    Into S_SysDate
    From S_PRD_MST
   Where to_char(Sysdate,'YYYY') Between  F_yr_no and T_yr_no ;

  Return(S_SysDate);

 Exception
  When Others Then
    Begin
      Select Sysdate
	Into S_SysDate
	From S_PRD_DTL
       Where to_char(Sysdate,'DD/MM/YYYY') Between  F_DATE and T_DATE ;

       Return(S_SysDate);

     Exception
     when others then
      Select Max(t_date) Into S_SysDate From S_PRD_DTL;
       Return(S_SysDate);
    End;
End Get_Sysdate;
--===========================================================================================
FUNCTION Get_Curdate  RETURN DATE Is
 S_SysDate Date;
Begin
  Select Sysdate Into S_SysDate From dual;
  Return(S_SysDate);

 Exception When Others Then
  Return(Null);
End Get_Curdate;
--===========================================================================================
FUNCTION Get_Local_Cur RETURN VARCHAR2 Is
 V_Local_cur VARCHAR2(7);
Begin
  Select Cur_Code
    Into V_Local_cur
    From Ex_rate
   Where L_F=1;

  Return(V_Local_cur);

 Exception
 When Others Then
  Return(Null);
End Get_Local_Cur;
--===========================================================================================
FUNCTION Get_Stk_Cur RETURN VARCHAR2 Is
 V_stk_cur VARCHAR2(7);
Begin
  Select Cur_Code
    Into V_stk_cur
    From Ex_rate
   Where Stock_cur=1;

  Return(V_stk_cur);

 Exception
 When Others Then
  Return(Null);
End Get_Stk_Cur;
--===========================================================================================
Function Get_Cur_Rate (P_Acy	   In Varchar2		   ,
		       P_Rate_Type In Number Default  0    ,
		       P_Date	   In Date   Default  Null ) Return Number Is
V_Cur_Rate  Number ;
  V_Up_Date    Date  ;
  -- P_Type = 0  Get Current Rate
  -- P_Type = 1  Get Period Rate
 Begin
   If P_Acy Is Not Null Then			       	
       -- Get Last Rate
	 Begin
	   Select Nvl(Cur_Rate,1)
	     Into V_Cur_Rate
	    From Ex_Rate
	     Where Cur_Code = P_Acy;
	 Exception
	   When No_Data_Found Then
	    Return(Null);
	   When Others Then
	    Raise_Application_Error(-20408,' Error When Get Currency rate = '||Sqlerrm) ;
	 End ;
   End If;
   Return(V_Cur_Rate);
 End Get_Cur_Rate;
--===========================================================================
	FUNCTION Get_Lev_Prv (P_UserNo In Number,P_Icode Varchar2 Default Null,P_Price_Type Number Default Null,P_Wcode Number Default Null,P_Brn_No Number Default Null) RETURN NUMBER Is
	  V_LevNo Number;
	BEGIN
	   If P_Icode Is Null Then
	      SELECT Lev_No
		 Into v_LevNo
		 From Ias_Priv_Price
		Where U_Id = P_UserNo
		  and Nvl(Add_Flag,0)=1
		  and Rownum <=1
		ORDER BY Lev_No ;
	   Else
	    If Nvl(P_Price_Type,1) Not In (2,5) Or (Nvl(P_Price_Type,1)=2 And P_Wcode Is Null) Then
		     SELECT Ias_Pricing_Levels.Lev_No
		      Into v_LevNo
		      From Ias_Pricing_Levels,Ias_Priv_Price
		     Where  Ias_Pricing_Levels.Lev_No=Ias_Priv_Price.Lev_No
			and U_Id = P_UserNo
			and Nvl(Add_Flag,0)=1
			and exists(select 1 From ias_item_price
				    where lev_no =  Ias_Pricing_Levels.lev_no
				      and i_code =  p_icode
				      and rownum <= 1)
		       and Rownum <=1
		      ORDER BY Ias_Pricing_Levels.Lev_No ; 	
		 End If;
	  End If;
	    Return(v_LevNo);
	 Exception
	   When others then
	    Return (0);
	End Get_Lev_Prv;
--===========================================================================
FUNCTION Get_Lev_Dflt_Prv (P_UserNo In Number,P_Icode Varchar2 Default Null,P_Price_Type Number Default Null,P_Wcode Number Default Null,P_Brn_No Number Default Null) RETURN NUMBER IS
  v_LevNo Number;
BEGIN
    If P_Icode Is Null Then
     SELECT Ias_Pricing_Levels.Lev_No
      Into v_LevNo
      From Ias_Pricing_Levels,Ias_Priv_Price
     Where Nvl(Ias_Pricing_Levels.Lev_Deflt,0)=1
	and Ias_Pricing_Levels.Lev_No=Ias_Priv_Price.Lev_No
	and U_Id = P_UserNo
       and Nvl(Add_Flag,0)=1
       and Rownum <=1
    ORDER BY Ias_Pricing_Levels.Lev_No ;
   Else
     If Nvl(P_Price_Type,1) Not In (2,5) Or (Nvl(P_Price_Type,1)=2 And P_Wcode Is Null) Then
	 SELECT Ias_Pricing_Levels.Lev_No
	  Into v_LevNo
	  From Ias_Pricing_Levels,Ias_Priv_Price
	 Where Nvl(Ias_Pricing_Levels.Lev_Deflt,0)=1
	    and Ias_Pricing_Levels.Lev_No=Ias_Priv_Price.Lev_No
	    and U_Id = P_UserNo
	    and Nvl(Add_Flag,0)=1
	    and exists(select 1 From ias_item_price
			where lev_no =	Ias_Pricing_Levels.lev_no
			  and i_code =	p_icode
			  and rownum <= 1)
	   and Rownum <=1
	  ORDER BY Ias_Pricing_Levels.Lev_No ;
     End If;

    End If;

    Return(v_LevNo);
 Exception
   When others then
    Return (0);
End Get_Lev_Dflt_Prv;
--===========================================================================
FUNCTION Get_Frm_Prv (P_UserNo In Number , P_Frm_no In Number)	RETURN NUMBER Is

  v_IncFlg Number;
BEGIN
    Select nvl(Include_Flag,0)
      Into v_IncFlg
      From Privilege
     Where U_Id    = P_UserNo
       and Form_no = P_Frm_No
       and Rownum <=1 ;

    Return(v_IncFlg);
 Exception
   When others then
    Return (0);
End Get_Frm_Prv;
--===========================================================================
FUNCTION Get_One_Wcode RETURN NUMBER Is
  v_Wcode Number;
  cnt	  Number;
BEGIN

    Select w_code,Count(1)
      Into v_Wcode ,cnt
      From Warehouse_details
      Group By w_code;

    Return(v_Wcode);
 Exception
   When others then
    Return (Null);
End Get_One_Wcode;
--===========================================================================
Function Get_Itm_Price_Docacy ( P_Icode 		       In Ias_Itm_Mst.I_Code%Type,
				P_Itm_Unt		       In Ias_Itm_Dtl.Itm_Unt%Type,
				P_Acy			       In Varchar2,
				P_Loc_Cur		       In Varchar2,
				P_Stk_Cur		       In Varchar2,
				P_Ac_Rate		       In Number,
				P_Stk_Rate		       In Number,
				P_Lev_No	  		   In Number,
				P_Wcode 		       In Number    Default Null,
				P_Iqty			       In Number    Default Null,
				P_Bill_Doc_Type 	       In Number    Default Null,
				P_Price_Type		       In Number    Default 1 ,
				P_Brn_No		       In Number    Default Null,
				P_Exp_Date		       In Date	    Default Null,
				P_Batch_No		       In Varchar2  Default Null,
				P_Use_Price_Exp_Date	       In Number    Default 0,
				P_Use_Price_Batch_No	       In Number    Default 0,
				P_Use_Exp_Date		       In Number    Default 0,
				P_Use_Batch_No		       In Number    Default 0,
				P_Itm_Use_Price_ExpDate_Optnl  In Number    Default 0,
				P_Itm_Use_Price_BtchNo_Optnl   In Number    Default 0) Return Number Is
  V_Price    Number;
  V_Whr      Varchar2(10000):='';
  V_Whr1     Varchar2(10000):='';
Begin
    ---------------------------------------------------------------------------
    If P_Price_Type=2 Then
      V_Whr := V_Whr||' And b.W_Code='||P_Wcode;
    End If;
    ---------------------------------------------------------------------------
    If P_Price_Type In (3,4) And P_Iqty Is Not Null Then
       V_Whr := V_Whr || ' And '||P_Iqty||' Between Nvl(b.From_Qty,0)  And Nvl(b.To_Qty,0)';
    End If;
    ---------------------------------------------------------------------------
    If P_Price_Type=5 Then
       V_Whr := V_Whr||' And b.Brn_No='||P_Brn_No;
    End If;
    ---------------------------------------------------------------------------
    ---------------------------------------------------------------------------
    If P_Use_Price_Exp_Date=1 And P_Use_Exp_Date=1 And Nvl(P_Exp_Date,'01/01/1900')<>'01/01/1900' Then
       V_Whr1 := ' And Nvl(b.Expire_Date,''01/01/1900'')='''||P_Exp_Date||'''';
    End If;
    ---------------------------------------------------------------------------
    If P_Use_Price_Batch_No=1 And P_Use_Batch_No=1 And Nvl(P_Batch_No,'0')<>'0' Then
       V_Whr1 := V_Whr1 || ' And Nvl(b.Batch_No,''0'')='''||P_Batch_No||'''';
    End If;
    ---------------------------------------------------------------------------
    V_Price := Ys_Gen_Pkg.Get_Cnt('Select Decode(a.A_Cy, '''||P_Acy||''', b.I_Price,
						       '''||P_Stk_Cur||''' , ((b.I_Price*'||P_Stk_Rate||')/'||P_Ac_Rate||'),
						       '''||P_Loc_Cur||''' , (b.I_Price/'||P_Ac_Rate||'),
			    				   ((b.I_Price * c.Cur_Rate ) / '||P_Ac_Rate||'))
				     From Ias_Pricing_Levels a,Ias_Item_Price b,Ex_Rate c
				    Where a.Lev_No   = b.Lev_No
				      And b.Lev_No   = '||P_Lev_No||'
				      And b.I_Code   = '''||P_Icode||'''
				      And b.Itm_Unt  = '''||P_Itm_Unt||'''
				      And c.Cur_Code = a.A_Cy
				      And Nvl(a.Bill_Doc_Type,0)= Decode(a.Bill_Doc_Type,Null,0,Decode('||Nvl(P_Bill_Doc_Type,1)||',4,2,1))
				      '||V_Whr||V_Whr1||'
				      And Rownum<=1');
    ---------------------------------------------------------------------------
    If Nvl(V_Price,0)=0 And ((P_Itm_Use_Price_ExpDate_Optnl=1 And P_Use_Price_Exp_Date=1 And P_Use_Exp_Date=1) Or (P_Itm_Use_Price_BtchNo_Optnl=1 And P_Use_Price_Batch_No=1 And P_Use_Batch_No=1)) Then
	  ---------------------------------------------------------------------------
	  V_Whr1 := Null;
	  ---------------------------------------------------------------------------
	  If P_Use_Price_Exp_Date=1 And P_Use_Exp_Date=1 Then
	     V_Whr1 := ' And Nvl(b.Expire_Date,''01/01/1900'')=''01/01/1900''';
	  End If;
	  ---------------------------------------------------------------------------
	  If P_Use_Price_Batch_No=1 And P_Use_Batch_No=1 Then
	     V_Whr1 := V_Whr1||' And Nvl(b.Batch_No,''0'')=''0''';
	  End If;
	  ---------------------------------------------------------------------------
	  V_Price := Ys_Gen_Pkg.Get_Cnt('Select Decode(a.A_Cy, '''||P_Acy||''', b.I_Price,
							   '''||P_Stk_Cur||''' , ((b.I_Price*'||P_Stk_Rate||')/'||P_Ac_Rate||'),
							   '''||P_Loc_Cur||''' , (b.I_Price/'||P_Ac_Rate||'),
							   ((b.I_Price * c.Cur_Rate ) / '||P_Ac_Rate||'))
					   From Ias_Pricing_Levels a,Ias_Item_Price b,Ex_Rate c
					  Where a.Lev_No   = b.Lev_No
					    And b.Lev_No   = '||P_Lev_No||'
					    And b.I_Code   = '''||P_Icode||'''
					    And b.Itm_Unt  = '''||P_Itm_Unt||'''
					    And c.Cur_Code = a.A_Cy
					    And Nvl(a.Bill_Doc_Type,0)= Decode(a.Bill_Doc_Type,Null,0,Decode('||Nvl(P_Bill_Doc_Type,1)||',4,2,1))
					    '||V_Whr||V_Whr1||'
					    And Rownum<=1');
    End If;
    ---------------------------------------------------------------------------
  Return(V_Price);

 Exception
   When others Then
    Return(0);
End;
--===========================================================================
FUNCTION Get_Low_Price ( P_Icode    In Ias_Itm_Mst.I_CODE%TYPE,
			 P_Itm_Unt  In Ias_Itm_DTL.ITM_UNT%TYPE,
			 P_acy	    In Varchar2,
			 P_loc_cur  In Varchar2,
			 P_Stk_cur  In Varchar2,
			 P_ac_rate  In Number,
			 P_Stk_Rate In Number,
			 P_Price_Type In Number DEFAULT NULL,
			 P_W_CODE   In Number DEFAULT NULL,
			 P_QTY	    IN NUMBER DEFAULT NULL ) RETURN NUMBER IS

  v_LowPr      Number;
  v_LowPr_Cur  Varchar2(7);
  v_LowPr_rate Number;
  v_Rate	  Number;
  v_price      Number;
BEGIN

Begin
 Select (nvl(i_price,0)),a_cy,nvl(cur_rate,1)
   Into v_lowpr,v_LowPr_Cur,v_LowPr_rate
   From Ias_pricing_levels,Ias_Item_Price,Ex_rate
  Where Ias_pricing_levels.lev_no=Ias_Item_Price.lev_no
    and lev_Low = 1
    and i_code	= P_Icode
    and Ias_Item_Price.Itm_Unt =P_Itm_Unt
    and cur_code= a_cy
    And Decode(P_Price_Type,2,Ias_Item_Price.W_Code,4,Ias_Item_Price.W_Code,0)=Decode(P_Price_Type,2,P_W_Code,4,P_W_Code,0)
   And Decode(P_Price_Type,3,Nvl(P_Qty,0),4,Nvl(P_Qty,0),0) Between
	      Decode(P_Price_Type,3,Nvl(From_Qty,0),4,Nvl(From_Qty,0),0)  And Decode(P_Price_Type,3,Nvl(To_Qty,0),4,Nvl(To_Qty,0),0);
Exception
 --When no_data_found Then
 -- v_lowpr:=0;
 When Others Then
  v_lowpr:=0;
End;

If v_LowPr_Cur = P_acy	Then --(1)
   v_price:=v_lowpr;
Elsif v_LowPr_Cur = P_Stk_cur Then --(1)
   v_price:=(v_lowpr*P_Stk_Rate)/P_ac_rate;
Elsif v_LowPr_Cur = P_Loc_cur Then --(1)
   v_price:=v_lowpr/P_ac_rate;
Else--(1)
   v_price:=(v_lowpr * v_LowPr_rate ) / P_ac_rate;
End If;--(1)

 Return(v_price);

End;
--------------------------------------------------------------------------------------------------------------
FUNCTION Get_High_Price ( P_Icode    In Ias_Itm_Mst.I_CODE%TYPE,
			  P_ITM_UNT  In Ias_Itm_DTL.ITM_UNT%TYPE,
  				    P_acy      In Varchar2,
  				    P_loc_cur  In Varchar2,
			  P_Stk_cur  In Varchar2,
			  P_ac_rate  In Number,
			  P_Stk_Rate In Number,
			  P_Price_Type In Number DEFAULT NULL,
			  P_W_CODE   In Number DEFAULT NULL,
			  P_QTY      IN NUMBER DEFAULT NULL ) RETURN NUMBER is
  v_HighPr	Number;
  v_HighPr_Cur	Varchar2(7);
  v_HighPr_rate Number;
  v_Rate 	     Number;
  v_price      Number;
BEGIN

Begin
 Select (nvl(i_price,0)),a_cy,nvl(cur_rate,1)
   Into v_Highpr,v_HighPr_Cur,v_HighPr_rate
   From Ias_pricing_levels,Ias_Item_Price,Ex_rate
  Where Ias_pricing_levels.lev_no=Ias_Item_Price.lev_no
    and lev_High = 1
    and i_code	 = P_Icode
    And Ias_Item_Price.Itm_Unt	= P_Itm_Unt
    and cur_code = a_cy
    And Decode(P_Price_Type,2,Ias_Item_Price.W_Code,4,Ias_Item_Price.W_Code,0)=Decode(P_Price_Type,2,P_W_Code,4,P_W_Code,0)
    And Decode(P_Price_Type,3,Nvl(P_Qty,0),4,Nvl(P_Qty,0),0) Between
	      Decode(P_Price_Type,3,Nvl(From_Qty,0),4,Nvl(From_Qty,0),0)  And Decode(P_Price_Type,3,Nvl(To_Qty,0),4,Nvl(To_Qty,0),0);

Exception
 --When no_data_found Then
 -- v_Highpr:=0;
 When Others Then
  v_Highpr:=0;
End;

If v_HighPr_Cur = P_acy  Then --(1)
   v_price:=v_Highpr;
Elsif v_HighPr_Cur = P_Stk_cur Then --(1)
   v_price:=(v_Highpr*P_Stk_Rate)/P_ac_rate;
Elsif v_HighPr_Cur = P_Loc_cur Then --(1)
   v_price:=v_Highpr/P_ac_rate;
Else--(1)
   v_price:=(v_Highpr * v_HighPr_rate ) / P_ac_rate;
End If;--(1)

 Return(v_price);

End;
----------------------------------------------

--=========================================================================
---## Get_Item_Prcie
--=========================================================================
FUNCTION Get_Itm_Price (P_LevNo    In Number,
												P_Icode    In Ias_Itm_Mst.I_CODE%TYPE,
												P_ITM_UNT  In Ias_Itm_DTL.ITM_UNT%TYPE,
			P_acy 	   In varchar2 ,
			P_billrate In Number,
			P_c_code   In CUSTOMER.C_CODE%TYPE Default Null,
			P_w_code   In WAREHOUSE_DETAILS.W_CODE%TYPE   Default Null,
							    P_Frc_no   In Number   Default 2 ) Return Number Is


 v_PriceItem	NUMBER;
 v_RatePrice	NUMBER;
 v_CPL		NUMBER :=0;
 v_Lev_Num	NUMBER (2);
 v_LevCur	varchar2 (7);

Begin

--========================================================================================
If P_LevNo Is Null Then
    Begin
       Select Min(Lev_No)
	 Into v_Lev_Num
	 From IAS_PRICING_LEVELS;
	   Exception When Others Then
       Return(null);
    End ;

 Else
   v_Lev_Num:=P_LevNo;
 End If;

Begin
 Select A_Cy
   Into v_LevCur
   From IAS_PRICING_LEVELS
  Where Lev_no=v_Lev_Num;
 Exception When Others Then
   Null;
End;


 If v_levCur = P_acy and P_billrate Is Not Null Then
     v_RatePrice:=P_billrate;
 Else
    v_RatePrice:=Ias_gen_Pkg.Get_cur_rate(v_LevCur);
 End If;


----------------------------------------------------------------------------
--BillDocType=4 and

 If P_c_code Is Not Null Then --(1)

   BEGIN
     Select Lev_No
       Into v_CPL
       From Customer_Curr
      Where c_code = P_c_code
	and a_cy   = P_acy;

       If v_CPL  Is Not Null  Then --(2)
	  If nvl(v_PriceItem,0) = 0 Then --(3)
	     Select Round((nvl(I_Price,0)* v_RatePrice * 1/P_BillRate),P_Frc_no)
	       Into v_PriceItem
	       From Ias_Item_Price
	      Where Lev_No = v_CPL
  		    and I_code = P_Icode;
		   End If; --(3)
       End If;	--(2)

      Exception When Others Then
       Return(null);
   END ;
 End If;  --(1)

   If nvl(v_PriceItem,0) = 0   Then --(4)

    Begin
	
       Select Round((Nvl(I_Price,0) * v_RatePrice * 1/P_BillRate),P_Frc_no)
	  Into v_PriceItem
	  From Ias_Item_Price
	 Where Lev_No = v_Lev_Num
		       and I_code = P_Icode
		       and Itm_Unt  = P_Itm_Unt
		       and nvl(w_code,0) = Decode(P_w_code,null,nvl(w_code,0),P_w_code);

     Exception When Others Then
	    null;
    End;
	
  End If; --(4)

  Return(v_PriceItem );

 Exception
  When others Then
   return(0);
END Get_Itm_Price;
--===========================================================================================
PROCEDURE Get_Fields (P_IAS_User In varchar2, P_Tab_Nm In Varchar2 ,P_WHR In varchar2 Default Null)  Is
v_col	Varchar2(4000);

   Cursor F_cv Is Select COLUMN_NAME From ALL_TAB_COLUMNS
    						   Where OWNER=P_IAS_User And Table_Name = Upper(P_Tab_Nm) ORDER BY COLUMN_ID;

Begin

    For i In F_cv Loop
	v_col:= v_col||','||i.COLUMN_NAME;
    End Loop;

    v_col := Substr(v_col,2);


    Execute Immediate ('Insert Into '||P_Tab_Nm||' ('||v_col||')
    						   Select '||v_col||' From '||P_IAS_User||'.'||P_Tab_Nm||' '||P_WHR);
 Exception     					
  When others Then
   Raise_Application_Error(-20408,' Error When Insert Data = '||P_Tab_Nm||' '||Sqlerrm) ;

End Get_Fields;
--===========================================================================================
FUNCTION Get_Fld_Value (P_Tab_Nm In Varchar2 ,P_Fld_Nm In Varchar2,P_WHR In varchar2 Default Null)  RETURN VARCHAR2 Is

V_Fld_Value Varchar2(60);

Begin

    Execute Immediate ('Select '||P_Fld_Nm ||' From '|| P_Tab_Nm ||' '||P_WHR) Into  V_Fld_Value  ;

    Return (V_Fld_Value);

 Exception
  When others Then
   Return Null;
End Get_Fld_Value;
--===========================================================================================
FUNCTION Get_Flg_Nm (P_flg_code In varchar2,P_flg_value In Number ,P_Lng_no In Number Default 1)  RETURN VARCHAR2 Is
 v_flg_nm  varchar2(100);
BEGIN
 Select flg_desc
   Into v_flg_nm
   From s_flags
  Where lang_no=P_Lng_no
    and flg_code=P_flg_code
    and flg_value=P_flg_value
    and RowNum<=1;

   Return(v_flg_nm);
 Exception
   When Others Then
     Return(Null);
End Get_Flg_Nm;
--===========================================================================================
FUNCTION Get_Prompt (P_Lng_no In number ,P_Lbl_no In Number) RETURN CHAR Is
 v_cap_det varchar2(100);
BEGIN
 Select Caption_det
   Into v_cap_det
   From Ias_Sys.IAS_LABELS
  Where lang_no=P_Lng_no
    and Label_no=P_Lbl_no;
   Return(v_cap_det);
 Exception
   When Others Then
     Return(Null);
END Get_Prompt;

--===========================================================================================
FUNCTION  Get_Msg	(P_Lng_no In number ,P_Msg_no In Number) RETURN CHAR Is
 v_cap_det varchar2(250);
BEGIN
 Select Caption_det
   Into v_cap_det
   From Ias_Sys.IAS_MSGS
  Where lang_no=P_Lng_no
    and Msg_no=P_Msg_no;

   Return(v_cap_det);
 Exception When Others Then
  Return(Null);
END Get_Msg;
--===========================================================================================
FUNCTION  Get_Frm_Nm (P_Frm_No In Number,P_Lng_no In Number Default 1)	RETURN VARCHAR2 Is
v_Frm_Nm varchar2(60);
BEGIN
 Select Form_Name
   Into v_Frm_Nm
   From Ias_Form_Name
  Where Lang_no = p_Lng_no
    and Form_no=P_Frm_No
    and RowNum<=1;

   Return(v_Frm_Nm);
 Exception When Others Then
   Return(Null);
END Get_Frm_Nm;
--===========================================================================================
FUNCTION  Get_Brn_Nm (P_Brn_No In Number,P_Lng_no In Number Default 1)	RETURN VARCHAR2 Is
v_Brn_Nm  varchar2(60);
BEGIN
 Select Decode(P_Lng_no,1,BRN_LNAME,nvl(BRN_FNAME,BRN_LNAME))
   Into v_Brn_Nm
   From S_Brn
  Where Brn_no=P_Brn_No
    and RowNum<=1;

   Return(v_Brn_Nm);
 Exception When Others Then
   Return(Null);
END Get_Brn_Nm;
--===========================================================================================
FUNCTION  Get_Usr_Nm (P_Usr_No In Number,P_Lng_no In Number Default 1)	RETURN VARCHAR2 Is
v_Usr_Nm varchar2(60);
BEGIN
 Select Decode(p_Lng_no,1,U_a_Name,nvl(U_e_Name,U_a_Name))
   Into v_Usr_Nm
   From User_r
  Where U_Id=P_Usr_No
    and RowNum<=1;

   Return(v_Usr_Nm);
 Exception When Others Then
   Return(Null);
END Get_Usr_Nm;
--===========================================================================================
FUNCTION  Get_Usr_Adm (P_Usr_No In Number)  RETURN NUMBER Is
v_Usr_adm Number;
BEGIN
 Select nvl(Admin_User,0)
   Into v_Usr_adm
   From User_r
  Where U_Id=P_Usr_No
    and RowNum<=1;

   Return(v_Usr_adm);
 Exception When Others Then
   Return(0);
END Get_Usr_Adm;
--===========================================================================================
FUNCTION  Get_Usr_Apprv ( P_Usr_No In Number ,
			  P_Frm_No In Number ,
			  P_Tab_Nm In Varchar2,
			  P_Fld_Nm In Varchar2)  RETURN NUMBER Is
v_Appr Number;
BEGIN

 Select 1
   Into v_Appr
   From ias_frm_fld_priv
  Where U_Id=P_Usr_No
    and Form_no=P_Frm_No
    and Tab_name=Upper(P_Tab_Nm)
    and Fld_name=Upper(P_Fld_Nm)
    and Priv_flag=1
    and RowNum<=1;

   Return(v_Appr);
 Exception
  When Others Then
   Return(0);
END Get_Usr_Apprv;
--===========================================================================================
--===========================================================================================
FUNCTION Get_Update_Doc_Period (P_UserNo  In Number ,
				P_Ad_Date In Date   )  RETURN NUMBER Is

  V_Doc_Day_Prd Privilege_Fixed.Upd_Doc_Day_Prd%Type ;
  V_Doc_Hrs_Prd Privilege_Fixed.Upd_Doc_Hrs_Prd%Type ;
  V_Ret_Value	Number := 0 ;

Begin
    Select Upd_Doc_Day_Prd ,
	   Upd_Doc_Hrs_Prd
     Into V_Doc_Day_Prd ,
	  V_Doc_Hrs_Prd
      From Privilege_Fixed
     Where  U_Id = P_UserNo ;
    If Nvl(V_Doc_Day_Prd,0) <> 0 Then
       If P_Ad_Date + V_Doc_Day_Prd < Ias_Gen_Pkg.Get_Curdate  Then
	 V_Ret_Value := 1 ;
       End If ;
    End If ;
    If Nvl(V_Doc_HRS_Prd,0) <> 0 Then
       If P_Ad_Date + (V_Doc_HRS_Prd/24) < Ias_Gen_Pkg.Get_Curdate  Then
	 V_Ret_Value := 2 ;
       End If ;
    End If ;
    Return(V_Ret_Value);
 Exception
   When Others Then
    Return (0);
End Get_Update_Doc_Period  ;
--===========================================================================================
FUNCTION Get_Delete_Doc_Period (P_UserNo  In Number ,
			    P_Ad_Date In Date	)  RETURN NUMBER Is
  V_Doc_Day_Prd Privilege_Fixed.Del_Doc_Day_Prd%Type ;
  V_Doc_Hrs_Prd Privilege_Fixed.Del_Doc_Hrs_Prd%Type ;
  V_Ret_Value	Number := 0 ;
Begin
    Select Del_Doc_Day_Prd ,
	   Del_Doc_Hrs_Prd
     Into V_Doc_Day_Prd ,
	  V_Doc_Hrs_Prd
      From Privilege_Fixed
     Where  U_Id = P_UserNo ;
    If Nvl(V_Doc_Day_Prd,0) <> 0 Then
       If P_Ad_Date + V_Doc_Day_Prd < Ias_Gen_Pkg.Get_Curdate  Then
	 V_Ret_Value := 1 ;
       End If ;
    End If ;
    If Nvl(V_Doc_HRS_Prd,0) <> 0 Then
       If P_Ad_Date + (V_Doc_HRS_Prd/24) < Ias_Gen_Pkg.Get_Curdate  Then
	 V_Ret_Value := 2 ;
       End If ;
    End If ;
    Return(V_Ret_Value);
 Exception
   When Others Then
    Return (0);
End Get_Delete_Doc_Period  ;
--===========================================================================================
FUNCTION Get_Low_Lvl_Price ( P_Usr_No In User_R.U_Id%Type  ) RETURN NUMBER  Is
       V_Low_Lvl_Price Ias_Pricing_Levels.Lev_No %Type ;
     Begin
	 -------------------------------------------------------------------
	Begin
	     /*
	     Select Low_Lvl_Price
	      Into  V_Low_Lvl_Price
	      From User_R
		Where U_Id = P_Usr_No ;
		*/
		V_Low_Lvl_Price := IAS_USR_PKG.GET_USR_FLD_DFLT_VAL_FNC (P_U_ID   => P_Usr_No  , P_FLD_NM => 'LOW_LVL_PRICE') ;
	Exception
	     When Others Then
		V_Low_Lvl_Price := Null ;
	End ;
	 -------------------------------------------------------------------
	 If  V_Low_Lvl_Price  Is  Null	Then
		 Begin
		   Select Lev_No
		    Into V_Low_Lvl_Price
		   From Ias_Pricing_Levels
		     Where Nvl(Ias_Pricing_Levels.Lev_Low,0) = 1
		      And Rownum <= 1 ;
		 Exception
		   When Others Then
		     V_Low_Lvl_Price := Null ;
		 End ;
	 End If ;
	 -------------------------------------------------------------------
	 Return (V_Low_Lvl_Price) ;
	 -------------------------------------------------------------------
     End Get_Low_Lvl_Price ;
--===========================================================================
    FUNCTION Get_High_Lvl_Price ( P_Usr_No In User_R.U_Id%Type	) RETURN NUMBER  Is
       V_High_Lvl_Price Ias_Pricing_Levels.Lev_No %Type ;
     Begin
	 -------------------------------------------------------------
	   Begin
	   /*
	     Select High_Lvl_Price
	      Into  V_High_Lvl_Price
	      From User_R
	     Where U_Id = P_Usr_No ;
	     */
	     V_High_Lvl_Price := IAS_USR_PKG.GET_USR_FLD_DFLT_VAL_FNC (P_U_ID	=> P_Usr_No  , P_FLD_NM => 'HIGH_LVL_PRICE') ;
	    Exception
		 When Others Then
		    V_High_Lvl_Price := Null ;
	   End ;
	 -------------------------------------------------------------
	 If  V_High_Lvl_Price  Is  Null  Then
		 Begin
		   Select Lev_No
		    Into V_High_Lvl_Price
		   From Ias_Pricing_Levels
		     Where Nvl(Ias_Pricing_Levels.Lev_High,0) = 1
		      And Rownum <= 1 ;
		 Exception
		   When Others Then
		     V_High_Lvl_Price := Null ;
		 End ;
	 End If ;
	 -------------------------------------------------------------
	 Return (V_High_Lvl_Price) ;
	 -------------------------------------------------------------
     End Get_High_Lvl_Price ;
--===========================================================================================
End IAS_Gen_Pkg;
/
