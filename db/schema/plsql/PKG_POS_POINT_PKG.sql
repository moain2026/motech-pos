-- =============================================
-- PACKAGE SPEC: POS_POINT_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
Package Pos_Point_Pkg As
 Function Get_Cust_Nm( P_Cust_Code In Ias_Cash_Custmr.Cust_Code%Type,P_Lng_No In Number) Return Varchar2;
 Function Check_Cust_Inactv(P_Cust_Code In Ias_Cash_Custmr.Cust_Code%Type) Return Number ;
 Function Get_Cust_Point_typ(P_Cust_Code In Ias_Cash_Custmr.Cust_Code%Type) Return Number ;
 Function Get_Point_Type_Nm(P_Point_Typ_No   In Ias_Point_Typ_Mst.Point_Typ_No%Type,P_Lng_No In Number) Return Varchar2;
 Function Check_Point_Type_State(P_Point_Typ_No   In Ias_Point_Typ_Mst.Point_Typ_No%Type) Return Number ;
 Procedure Get_Point_Typ_Min_Lmt(P_Point_Typ_No  In Ias_Point_Typ_Mst.Point_Typ_No%Type,
				 P_Min_Lmt_Calc  Out Number,
				 P_Min_Lmt_Rplc  Out Number,
				 P_C_Code_Csh	 In  VARCHAR2 DEFAULT NULL) ;
 Function Get_Point_Calc_Typ(P_Point_Typ_No   In Ias_Point_Typ_Mst.Point_Typ_No%Type) Return Number ;
 Function Get_Point_Cnt(P_Point_Typ_No	 In Ias_Point_Typ_Mst.Point_Typ_No%Type,P_Bill_Amt Number,P_G_Code In Varchar2 default Null) Return Number;
 Function Get_Point_Rplc_Cnt(P_Point_Typ_No   In Ias_Point_Typ_Mst.Point_Typ_No%Type,P_Amt_Rplc Number) Return Number;
 Function Get_Point_Amt     (P_Point_Typ_No   In Ias_Point_Typ_Mst.Point_Typ_No%Type,P_Point_cnt Number,P_G_Code In Varchar2 default Null) Return Number;
 Function Get_Point_Rplc_Amt(P_Point_Typ_No   In Ias_Point_Typ_Mst.Point_Typ_No%Type,P_Point_cnt Number) Return Number;
 Function Get_Cust_Point_bal(P_Cust_Code In Ias_Cash_Custmr.Cust_Code%Type,
			     P_Point_Typ_No   In Ias_Point_Typ_Mst.Point_Typ_No%Type Default Null,
			     P_Db_Link	      In Varchar2 Default Null,
			     P_Point_Aprvd_By_Day In number Default Null,
			     P_Lng_No	      In Number  default 1 ) Return Number;
 Procedure Check_Insert_Expired_Point(P_Ad_U_Id Number Default Null,
				      P_Brn_No Number Default Null,
				      P_Machine_No Number Default Null);
 Procedure Insrt_Pos_Point_Trns(P_TRNS_NO    IN NUMBER,
			      P_TRNS_DATE    IN DATE,
			      P_CUST_CODE    IN Ias_Cash_Custmr.Cust_Code%Type,
			      P_MOBILE_NO    IN Ias_Cash_Custmr.MOBILE_NO%Type,
			      P_POINT_TYP_NO IN Ias_Point_Typ_Mst.Point_Typ_No%Type,
			      P_Bill_NO      IN NUMBER,
			      P_DOC_AMT      IN NUMBER,
			      P_POINT_CNT    IN NUMBER,
			      P_TRNS_TYPE    IN NUMBER,
			      P_A_CY	     IN VARCHAR2,
			      P_AC_RATE      IN NUMBER,
			      P_machine_no   IN IAS_POS_MACHINE.MACHINE_NO%TYPE,
			      P_AD_U_ID      IN USER_R.U_ID%TYPE,
			      P_AD_DATE      IN DATE,
			      P_CMP_NO	     IN Pos_Point_Calc_trns.CMP_NO%TYPE,
			      P_BRN_NO	     IN Pos_Point_Calc_trns.BRN_NO%TYPE,
			      P_BRN_YEAR     IN Pos_Point_Calc_trns.BRN_YEAR%TYPE,
			      P_BRN_USR      IN Pos_Point_Calc_trns.BRN_USR%TYPE,
			      P_Bill_Amt     IN NUMBER,
			      P_Yr_Br_Usr    IN VARCHAR2,
			      P_Db_Link      IN VARCHAR2,
			      P_Point_Age_Expired_Typ In Number,
			      P_Point_Age_Expired_Prd In Number);
Function Get_Expire_Date (  P_Point_Typ_No	    In Ias_Point_Typ_Mst.Point_Typ_No%Type    ,
			    P_Cust_Code 	    In Ias_Cash_Custmr.Cust_Code%Type,
			    P_Point_Age_Expired_Typ In	Number ,
			    P_Point_Age_Expired_Prd In	Number ) Return Date ;
FUNCTION Chk_Point_Trns(  P_Bill_Date	       In Ias_Pos_Bill_Mst.Bill_Date%Type,
			   P_Cust_Code		In Ias_Cash_Custmr.Cust_Code%Type,
			   P_Point_Typ_No	In Ias_Point_Typ_Mst.Point_Typ_No%Type,
			   P_Point_Aprvd_By_Day In Number Default Null,
			   P_Yr_Br_Usr		In Varchar2,
			   P_Db_Link		In Varchar2  ) RETURN NUMBER;
FUNCTION Get_bill_doc_amt_point_fnc(P_Point_Typ_No In Number,
				    P_Bill_No	    In Number) Return Number;
End Pos_Point_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: POS_POINT_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY Pos_Point_Pkg AS
Function Get_Cust_Nm( P_Cust_Code In Ias_Cash_Custmr.Cust_Code%Type,P_Lng_No In Number) Return Varchar2 Is
  V_Cust_Name	Ias_Cash_Custmr.Cust_L_Nm%Type;
Begin
    Begin
		Select Decode(P_Lng_No,1,Cust_L_Nm,Nvl(Cust_F_Nm,Cust_L_Nm))
		    Into V_Cust_Name
		   From Ias_Cash_Custmr
		    Where Cust_Code=P_Cust_Code
		      And Rownum<=1;
		   	Exception When Others Then
			 V_Cust_Name:=NULL;
		    END;
	      IF V_Cust_Name IS NULL THEN
			BEGIN
					   Select Decode(P_Lng_No,1,Cust_L_Nm,Nvl(Cust_F_Nm,Cust_L_Nm))
							  Into V_Cust_Name
							   From IAS_CASH_CUSTMR_BRN
							    Where Cust_Code=P_Cust_Code
							      And Rownum<=1;
						Exception When Others Then
		     NULL;
		  END;
		      END IF;	
	    Return(V_Cust_Name);	
Exception When Others Then
 Return(Null);
End Get_Cust_Nm;
--##---------------------------------------------------------------------------------##--
Function Check_Cust_Inactv (P_Cust_Code In Ias_Cash_Custmr.Cust_Code%Type) Return Number Is
 V_Inactv  Number;
Begin
  Select Nvl(Inactive,0)
   Into V_Inactv
    From Ias_Cash_Custmr
     Where Cust_Code=P_Cust_Code
      And Rownum<=1;
     Return(V_Inactv);
 Exception When Others Then
    Return(0);
End Check_Cust_Inactv;
--##---------------------------------------------------------------------------------##--
Function Get_Cust_Point_Typ( P_Cust_Code In Ias_Cash_Custmr.Cust_Code%Type) Return Number Is
  V_Point_typ_no   Ias_Point_Typ_Mst.Point_Typ_No%Type;
Begin
     Select Point_Typ_No
	  Into V_Point_typ_no
	   From Ias_Cash_Custmr
	    Where Cust_Code=P_Cust_Code
	      And Rownum<=1;	
	    Return(V_Point_typ_no);	
Exception When Others Then
 Return(Null);
End Get_Cust_Point_Typ;
--##---------------------------------------------------------------------------------##--
Function  Get_Point_Type_Nm(P_Point_Typ_No In Ias_Point_Typ_Mst.Point_Typ_No%Type,P_Lng_No In Number) Return Varchar2 Is
  V_Type_Name  Ias_Point_Typ_Mst.Typ_l_Nm%Type;
Begin
     Select Decode(P_Lng_No,1,Typ_L_Nm,Nvl(Typ_F_Nm,Typ_L_Nm))
	  Into V_Type_Name
	   From  Ias_Point_Typ_Mst
	 Where Point_Typ_No=P_Point_Typ_No
	      And Rownum<=1;	
	    Return(V_Type_Name);	
Exception When Others Then
 Return(Null);
End Get_Point_Type_Nm;
--##---------------------------------------------------------------------------------##--
Function Check_Point_Type_State (P_Point_Typ_No   In Ias_Point_Typ_Mst.Point_Typ_No%Type)  Return Number Is
 V_State  Number :=0;
Begin
If P_Point_Typ_No IS NOT NULL THEN
		 Begin
		  Select Nvl(Inactive,0)
		   Into  V_State
		    From  Ias_Point_Typ_Mst
		     Where Point_Typ_No=P_Point_Typ_No
		      And Rownum<=1;
		    If Nvl(V_State,0)=1 Then
		     V_State:=1637;
		    End If;
		 Exception When Others Then
		    V_State:=0;
		 End;
	 If  Nvl(V_State,0)=0 Then
	  Begin
	   Select 1
	    Into V_State
	     From Ias_Point_Typ_Mst
	      Where Point_Typ_No=P_Point_Typ_No
	       And To_Date(Ias_Gen_Pkg.Get_Curdate,'DD/MM/YYYY')  Between To_date(Start_Date,'DD/MM/YYYY') And to_date(End_Date,'DD/MM/YYYY')
	       And Rownum<=1;
	      If Nvl(V_State,0)=1 Then
	       V_State:=0;
	      End If;
	  Exception When Others Then
	    V_State:=2222;
	  End;
	 End If;
 END IF;
 Return(V_State);
End Check_Point_Type_State;
--##---------------------------------------------------------------------------------##--
Procedure Get_Point_Typ_Min_Lmt(P_Point_Typ_No In Ias_Point_Typ_Mst.Point_Typ_No%Type,
				P_Min_Lmt_Calc	Out Number,
				P_Min_Lmt_Rplc	Out Number,
				P_C_Code_Csh	In  VARCHAR2 DEFAULT NULL) Is
V_RPLC_FOR_ONE_TIME   NUMBER := 0;
V_CNT_POINT	      NUMBER;
Begin
  Begin
   Select Min_Lmt_Calc,
	  Min_Lmt_Rplc,
	  MIN_LMT_RPLC_FOR_ONE_TIME
     Into P_Min_Lmt_Calc,
	  P_Min_Lmt_Rplc,
	  V_RPLC_FOR_ONE_TIME
     From Ias_Point_Typ_Mst
    Where Point_Typ_No=P_Point_Typ_No;
  Exception When Others Then
     Null;
  End;
  IF NVL(V_RPLC_FOR_ONE_TIME,0) =1 and P_C_Code_Csh is not null THEN
      Begin
	 SELECT sum(point_cnt) INTO V_CNT_POINT
	  FROM POS_POINT_CALC_TRNS
	 WHERE CUST_CODE = P_C_Code_Csh
	   AND POINT_TYP_NO=P_Point_Typ_No
	   AND POINT_CNT > 0;
      EXCEPTION WHEN OTHERS THEN
	V_CNT_POINT := 0;
      End;
      IF NVL(V_CNT_POINT,0)=0 THEN
	       Begin
					 V_CNT_POINT := Ias_Gen_Pkg.Get_Cnt('Select sum(point_cnt) From MV_POS_CUST_POINT_BAL
																	     Where CUST_CODE ='''||P_C_Code_Csh||'''
																	       AND POINT_TYP_NO='||P_Point_Typ_No||'
																	       And RowNum<=1');		
				 Exception When Others Then
			      V_CNT_POINT:=0;
				 End;
      END IF;
  END IF;
  IF NVL(V_RPLC_FOR_ONE_TIME,0) = 1  AND  NVL(V_CNT_POINT,0) >= NVL(P_Min_Lmt_Rplc,0) THEN
      P_Min_Lmt_Rplc := 0;
  END IF;
End Get_Point_Typ_Min_Lmt ;
--##---------------------------------------------------------------------------------##--
Function Get_Point_Calc_Typ(P_Point_Typ_No In Ias_Point_Typ_Mst.Point_Typ_No%Type)  Return Number Is
 V_Calc_Typ  Number(1);
Begin
  Select Point_Calc_Typ
   Into  V_Calc_Typ
    From Ias_Point_Typ_Mst
     Where Point_Typ_No=P_Point_Typ_No
      And Rownum<=1;
     Return(V_Calc_Typ);
 Exception When Others Then
    Return(null);
End Get_Point_Calc_Typ;
--##---------------------------------------------------------------------------------##--
Function Get_Point_Cnt(P_Point_Typ_No	In Ias_Point_Typ_Mst.Point_Typ_No%Type,P_Bill_Amt Number,P_G_Code In Varchar2 default Null) Return Number Is
 V_Point_Cnt  Number;
 V_Point_Calc_Typ Number;
 V_Amt_4Point	   Number;
 V_Prg_Calc_Typ    Number;
Begin

 V_Point_Calc_Typ:=Pos_Point_Pkg.Get_Point_Calc_Typ(P_Point_Typ_No);
    If V_Point_Calc_Typ =1 Then
	Begin
	 Select  Amt_4Point Into V_Amt_4Point
	  From Ias_Point_Typ_Mst
	  Where Point_Typ_No=P_Point_Typ_No;
	Exception When Others Then
	 V_Amt_4Point:=0;
	End;
	V_Point_Cnt:=(P_Bill_Amt / V_Amt_4Point);	
    Elsif V_Point_Calc_Typ=2 Then
	Begin
	 Select  Amt_4Point,Point_Cnt Into V_Amt_4Point,V_Point_Cnt
	  From Ias_Point_Typ_Mst
	  Where Point_Typ_No= P_Point_Typ_No;
	Exception When Others Then
	 V_Amt_4Point:=0;
	 V_Point_Cnt :=0;
	End;
	V_Point_Cnt:=(P_Bill_Amt / V_Amt_4Point)*V_Point_Cnt;
    Elsif  V_Point_Calc_Typ=3 Then
      Begin
	 Select Point_Cnt Into V_Point_Cnt
	  From Ias_Point_Typ_Calc_Dtl
	  Where Point_Typ_No= P_Point_Typ_No
	  And  P_Bill_Amt Between  From_Amt And To_Amt;
	Exception When Others Then
	 V_Point_Cnt:=0;
	End;
    ElsIf V_Point_Calc_Typ = 4 Then
	Begin
	 Select  Amt_4Point Into V_Amt_4Point
	   From Ias_Point_Typ_Grp_Dtl
	  Where Point_Typ_No=P_Point_Typ_No
	    And G_Code	    =P_G_Code;
	Exception When Others Then
	 V_Amt_4Point:=0;
	End;
	V_Point_Cnt:=(P_Bill_Amt / V_Amt_4Point);
  End If;
   Begin
    Select Point_Calc_Typ Into	V_Prg_Calc_Typ
      From Ias_Para_Ar;
    Exception When Others Then
	V_Prg_Calc_Typ:=0;
    End;
  If V_Prg_Calc_Typ=0 Then
    V_Point_Cnt:=Trunc(V_Point_Cnt);
  End If;
Return(V_Point_Cnt);
 Exception When Others Then
    Return(Null);
End  Get_Point_Cnt;
--##---------------------------------------------------------------------------------##--
Function Get_Point_Rplc_Cnt(P_Point_Typ_No   In Ias_Point_Typ_Mst.Point_Typ_No%Type,P_Amt_Rplc Number) Return Number Is
 V_Point_Rplc_Cnt    Number;
 V_Point_Clc_Rlc_Typ Number;
 V_AMT_4POINT_RPLC   Number;
Begin

 V_Point_Clc_Rlc_Typ:=Pos_Point_Pkg.Get_Point_Calc_Typ(P_Point_Typ_No);
    If V_Point_Clc_Rlc_Typ IN(1,4) Then
	Begin
	 Select  AMT_4POINT_RPLC Into V_AMT_4POINT_RPLC
	  From Ias_Point_Typ_Mst
	  Where Point_Typ_No=P_Point_Typ_No;
	Exception When Others Then
	 V_AMT_4POINT_RPLC:=0;
	End;
	V_Point_Rplc_Cnt:=trunc(P_Amt_Rplc / V_AMT_4POINT_RPLC,0);	
    Elsif V_Point_Clc_Rlc_Typ=2 Then
	Begin
	 Select  AMT_4POINT_RPLC,POINT_CNT_RPLC Into V_AMT_4POINT_RPLC,V_Point_Rplc_Cnt
	  From Ias_Point_Typ_Mst
	  Where Point_Typ_No= P_Point_Typ_No;
	Exception When Others Then
	 V_AMT_4POINT_RPLC:=0;
	 V_Point_Rplc_Cnt :=0;
	End;
	V_Point_Rplc_Cnt:=trunc(P_Amt_Rplc / V_AMT_4POINT_RPLC,0)*V_Point_Rplc_Cnt;
    Elsif  V_Point_Clc_Rlc_Typ=3 Then
      Begin
      SELECT TO_POINT INTO V_Point_Rplc_Cnt
	FROM
	    (
	    Select TO_POINT
		      From IAS_POINT_TYP_RPLC_DTL
		      Where Point_Typ_No=P_Point_Typ_No
		      And  AMT<=P_Amt_Rplc
		      ORDER BY TO_POINT DESC
		      )
	     WHERE  ROWNUM<=1 ;
	Exception When Others Then
	 V_Point_Rplc_Cnt:=0;
	End;
  End If;
Return(V_Point_Rplc_Cnt);
 Exception When Others Then
    Return(Null);
End  Get_Point_Rplc_Cnt;
--##---------------------------------------------------------------------------------##--
Function Get_Point_Amt(P_Point_Typ_No	In Ias_Point_Typ_Mst.Point_Typ_No%Type,P_Point_cnt Number,P_G_Code In Varchar2 default Null) Return Number Is
 V_Point_Clc_Typ  Number;
 V_Amt_4Point	  Number;
 V_Point_Cnt	  Number;
 V_Amt		  Number;
Begin

    V_Point_Clc_Typ:=Pos_Point_Pkg.Get_Point_Calc_Typ(P_Point_Typ_No);
	    If V_Point_Clc_Typ =1 Then
		Begin
		 Select  Amt_4Point Into V_Amt_4Point
		  From Ias_Point_Typ_Mst
		  Where Point_Typ_No= P_Point_Typ_No;
		Exception When Others Then
		 V_Amt_4Point:=0;
		End;
	
		V_Amt:=P_Point_cnt*V_Amt_4Point;	
	
	    Elsif V_Point_Clc_Typ=2 Then
		Begin
		 Select  Amt_4Point,Point_Cnt Into V_Amt_4Point,V_Point_Cnt
		  From Ias_Point_Typ_Mst
		  Where Point_Typ_No= P_Point_Typ_No;
		Exception When Others Then
		 V_Amt_4Point:=0;
		 V_Point_Cnt :=0;
		End;
	
		V_Amt:=(V_Amt_4Point/V_Point_Cnt)*P_Point_cnt;		   	
	    Elsif  V_Point_Clc_Typ=3 Then
		Begin
		 Select Amt Into V_Amt
		  From IAS_POINT_TYP_RPLC_DTL
		  Where Point_Typ_No= P_Point_Typ_No
		  And  P_Point_cnt Between  From_Point And To_Point;
		Exception When Others Then
		 V_Amt:=0;
		End;
	    ElsIf V_Point_Clc_Typ = 4 Then
	    Begin
	     Select  Amt_4Point Into V_Amt_4Point
	       From Ias_Point_Typ_Grp_Dtl
	      Where Point_Typ_No=P_Point_Typ_No
		And G_Code	=P_G_Code;
	    Exception When Others Then
	     V_Amt_4Point:=0;
	    End;
	    V_Amt:=P_Point_cnt*V_Amt_4Point;
	   End If;
   Return(V_Amt);
 Exception When Others Then
    Return(Null);
End  Get_Point_Amt;
--##---------------------------------------------------------------------------------##--
Function Get_Point_Rplc_Amt(P_Point_Typ_No   In Ias_Point_Typ_Mst.Point_Typ_No%Type,P_Point_cnt Number) Return Number Is
 V_Point_Clc_Rlc_Typ   Number;
 V_Amt_4Point_rplc     Number;
 V_Point_Cnt_rplc      Number;
 V_Amt_Rplc	       Number;
Begin

    V_Point_Clc_Rlc_Typ:=Pos_Point_Pkg.Get_Point_Calc_Typ(P_Point_Typ_No);
	    If V_Point_Clc_Rlc_Typ IN(1,4) Then
		Begin
		 Select  Amt_4Point_rplc Into V_Amt_4Point_rplc
		  From Ias_Point_Typ_Mst
		  Where Point_Typ_No= P_Point_Typ_No;
		Exception When Others Then
		 V_Amt_4Point_rplc:=0;
		End;
	
		V_Amt_Rplc:=P_Point_cnt*V_Amt_4Point_rplc;	
	
	    Elsif V_Point_Clc_Rlc_Typ=2 Then
		Begin
		 Select  Amt_4Point_rplc,Point_Cnt_rplc Into V_Amt_4Point_rplc,V_Point_Cnt_rplc
		  From Ias_Point_Typ_Mst
		  Where Point_Typ_No= P_Point_Typ_No;
		Exception When Others Then
		 V_Amt_4Point_rplc:=0;
		 V_Point_Cnt_rplc :=0;
		End;
	
		   V_Amt_Rplc:=(V_Amt_4Point_rplc/V_Point_Cnt_rplc)*P_Point_cnt;		   	
	    Elsif  V_Point_Clc_Rlc_Typ=3 Then
		Begin
		 Select Amt Into V_Amt_Rplc
		  From IAS_POINT_TYP_RPLC_DTL
		  Where Point_Typ_No= P_Point_Typ_No
		  And  P_Point_cnt Between  From_Point And To_Point;
		Exception When Others Then
		 V_Amt_Rplc:=0;
		End;		     	
	   End If;
   Return(V_Amt_Rplc);
 Exception When Others Then
    Return(Null);
End  Get_Point_Rplc_Amt;
--##---------------------------------------------------------------------------------##--
Function Get_Cust_Point_bal(P_Cust_Code 	 In Ias_Cash_Custmr.Cust_Code%Type,
			    P_Point_Typ_No	 In Ias_Point_Typ_Mst.Point_Typ_No%Type Default Null,
			    P_Db_Link		 In Varchar2 Default Null,
			    P_Point_Aprvd_By_Day In  Number Default Null,
			    P_Lng_No		 In  Number  default 1)  Return number Is


 V_Whr	 Varchar2(1000);
 V_Point_Calc_Typ Number;
 V_Point_cnt  Number;
 V_Point_Amt_Bal Number;
Begin


V_Whr:=' and To_Date(trns_date,''DD/MM/YYYY'')<= Decode(Trns_Type,1,To_Date(Ias_Gen_Pkg.Get_Curdate,''DD/MM/YYYY'')-'||Nvl(P_Point_Aprvd_By_Day,0)||',To_Date(Ias_Gen_Pkg.Get_Curdate,''DD/MM/YYYY''))';
 If P_Db_Link Is Null Then
	If P_Point_Typ_No Is Not Null Then
	    Select Sum(Nvl(Point_Cnt,0)),Sum(Nvl(Doc_Amt,0))
	     Into  V_Point_cnt ,V_Point_Amt_Bal
	      From Pos_Point_Calc_Trns
	       Where Point_Typ_No=P_Point_Typ_No
		And Cust_Code	 = P_Cust_Code
		and To_Date(trns_date,'DD/MM/YYYY')<= Decode(Trns_Type,1,To_Date(Ias_Gen_Pkg.Get_Curdate,'DD/MM/YYYY')-Nvl(P_Point_Aprvd_By_Day,0),To_Date(Ias_Gen_Pkg.Get_Curdate,'DD/MM/YYYY'));

	Else
	    Select Sum(Nvl(Point_Cnt,0)),Sum(Nvl(Doc_Amt,0))
	       Into  V_Point_cnt,V_Point_Amt_Bal
		From Pos_Point_Calc_Trns
		 Where Cust_Code    = P_Cust_Code
		 and To_Date(trns_date,'DD/MM/YYYY')<= Decode(Trns_Type,1,To_Date(Ias_Gen_Pkg.Get_Curdate,'DD/MM/YYYY')-Nvl(P_Point_Aprvd_By_Day,0),To_Date(Ias_Gen_Pkg.Get_Curdate,'DD/MM/YYYY'));
	End If;
  Else
       If P_Point_Typ_No Is Not Null Then
	   Begin
	     Execute Immediate ' Select Sum(Nvl(Point_Cnt,0)),Sum(Nvl(Doc_Amt,0)) From '||User||'.Pos_Point_Calc_Trns@'||P_Db_Link||'
		Where Point_Typ_No ='|| P_Point_Typ_No||
		' And  Cust_Code   ='||''''|| P_Cust_Code ||''''||
		 V_Whr
		 Into V_Point_cnt,V_Point_Amt_Bal ;
	    Exception
	     When No_Data_Found Then
	      V_Point_cnt := 0 ;
	     When Others Then
	      Raise_application_error(-20001,Ias_Gen_Pkg.Get_Msg(P_Lng_No,2225) ||Chr(13)||SqlErrm);
	    End ;
       Else
	   Begin
	     Execute Immediate ' Select Sum(Nvl(Point_Cnt,0)),Sum(Nvl(Doc_Amt,0))  From '||User||'.Pos_Point_Calc_Trns@'||P_Db_Link||'
		Where  Cust_Code   ='||''''|| P_Cust_Code ||''''||V_Whr
		 Into V_Point_cnt,V_Point_Amt_Bal ;
	    Exception
	     When No_Data_Found Then
	      V_Point_cnt := 0 ;
	     When Others Then
	      Raise_application_error(-20001,Ias_Gen_Pkg.Get_Msg(P_Lng_No,2225) ||Chr(13)||SqlErrm);
	    End;
      End If;
  End If;

 Return(V_Point_Cnt);
End  Get_Cust_Point_bal;
--##---------------------------------------------------------------------------------##--
Procedure Check_Insert_Expired_Point(P_Ad_U_Id Number Default Null,P_Brn_No Number Default Null,P_Machine_No Number Default Null ) Is
  V_Point_Age_Expired Number;
  V_Point_Cnt	      Number;
  V_Point_Amt	      Number;
  V_Last_Expire_Date  Date;
Begin
  Begin
      Select POINT_AGE_EXPIRED_TYP Into V_Point_Age_Expired  From Ias_Para_Ar;
  Exception When Others   Then
       null;
  End;
  If V_Point_Age_Expired=0 Then
    If To_Char(Ias_Gen_Pkg.Get_Final_Day,'DD/MM/YYYY')>= To_Char(Ias_Gen_Pkg.Get_Curdate,'DD/MM/YYYY') Then
      Declare
	  Cursor C_Cust Is Select Cust_code,MOBILE_NO
	    From Pos_Point_Calc_trns
	     Where  To_Char(Trns_Date,'DD/MM/YYYY') <=To_Char(Ias_Gen_Pkg.Get_Final_Day,'DD/MM/YYYY')
	     Having  Nvl(Sum(POINT_CNT),0)>0
	     Group by  Cust_code,MOBILE_NO
	    Order By Cust_Code;
      Begin
	 For I_Cust In C_Cust Loop
	    Begin
	       Select Sum(POINT_CNT),Sum(DOC_AMT) into V_Point_Cnt,V_Point_Amt
		From Pos_Point_Calc_trns
		Where Cust_Code =I_Cust.Cust_code;
	    Exception When Others then
		 V_Point_Cnt:=0;
	    End;

	  If Nvl(V_Point_Cnt,0)>0 Then

	      Insert Into Pos_Point_Calc_trns (TRNS_NO,
					      TRNS_DATE,
					      CUST_CODE,
					      MOBILE_NO,
					      POINT_TYP_NO,
					      Bill_NO,
					      DOC_AMT,
					      POINT_CNT,
					      TRNS_TYPE,
					      machine_no,
					      AD_U_ID,
					      AD_DATE,
					      BRN_NO,
					      CMP_NO,
					      --BRN_YEAR,
					      BRN_USR )
				      Values(POS_POINT_SEQ.NEXTVAL,
					     To_Char(Ias_Gen_Pkg.Get_Sysdate,'DD/MM/YYYY') ,
					     I_Cust.Cust_code,
					     I_Cust.MOBILE_NO,
					     Pos_Point_Pkg.Get_Cust_Point_typ(I_Cust.Cust_code),
					     NULL ,
					     0,
					     -V_Point_Cnt,
					     9,
					     1 ,
					     1,
					     To_Char(Ias_Gen_Pkg.Get_Sysdate,'DD/MM/YYYY'),
					     1,
					     IAS_Brn_Pkg.Get_Br_Cmp(P_BRN_NO),
					     To_Number(To_Char(Ias_Gen_Pkg.Get_Sysdate,'YYYY'))
					     );
	  End if;
	 End Loop;
      End;
    End if;
  Elsif V_Point_Age_Expired>0 Then
      Declare
	  Cursor C_Cust
	  Is Select Cust_code,MOBILE_NO
	    From Ias_Cash_Custmr
	     Where   ADD_MONTHS (To_Char(FIRST_DEAL_DATE,'DD/MM/YYYY'),12*V_Point_Age_Expired) < To_Char(Ias_Gen_Pkg.Get_Sysdate,'DD/MM/YYYY')
	    Order By Cust_Code;
      Begin
	  For I_Cust In C_Cust Loop
	      Begin
	       Select Sum(POINT_CNT) into V_Point_Cnt
		From Pos_Point_Calc_trns
		Where Cust_Code =I_Cust.Cust_code;
	      Exception When Others then
		 V_Point_Cnt:=0;
	      End;
	      Begin
		Select	max(trns_date) into V_Last_Expire_Date
		From Pos_Point_Calc_trns
		Where Cust_Code =I_Cust.Cust_code
		  And trns_type=9;
	      Exception When Others Then
		  V_Last_Expire_Date:=Null;
	      End;


	   If Nvl(V_Point_Cnt,0)> 0 And ( V_Last_Expire_Date Is Null Or
	      ADD_MONTHS (To_Char(V_Last_Expire_Date,'DD/MM/YYYY'),12*V_Point_Age_Expired) < To_Char(Ias_Gen_Pkg.Get_Sysdate,'DD/MM/YYYY')  )	Then

	     Begin
	      Insert Into Pos_Point_Calc_trns (TRNS_NO,
					      TRNS_DATE,
					      CUST_CODE,
					      MOBILE_NO,
					      POINT_TYP_NO,
					      Bill_NO,
					      DOC_AMT,
					      POINT_CNT,
					      TRNS_TYPE,
					      machine_no,
					      AD_U_ID,
					      AD_DATE,
					      BRN_NO,
					      CMP_NO,
					      BRN_YEAR,
					      BRN_USR )
				      Values(POS_POINT_SEQ.NEXTVAL,
					     To_Char(Ias_Gen_Pkg.Get_Sysdate,'DD/MM/YYYY') ,
					     I_Cust.Cust_code,
					     I_Cust.MOBILE_NO,
					     NULL,
					     NULL ,
					     0,
					     -V_Point_Cnt,
					     9,
					     1 ,
					     1,
					     To_Char(Ias_Gen_Pkg.Get_Sysdate,'DD/MM/YYYY'),
					     1,
					     IAS_Brn_Pkg.Get_Br_Cmp(P_BRN_NO),
					     To_Number(To_Char(Ias_Gen_Pkg.Get_Sysdate,'YYYY')),
					     1);

	     Exception When Others Then
	     Raise_application_error(-20001,Ias_Gen_Pkg.Get_Msg(1,2225) ||Chr(13)||SqlErrm);
	     End;

	   End If;
	  End Loop;
      End;
  End If;
End  Check_Insert_Expired_Point;
--##---------------------------------------------------------------------------------##--
Procedure Insrt_Pos_Point_Trns(P_TRNS_NO     IN NUMBER,
			      P_TRNS_DATE    IN DATE,
			      P_CUST_CODE    IN Ias_Cash_Custmr.Cust_Code%Type,
			      P_MOBILE_NO    IN Ias_Cash_Custmr.MOBILE_NO%Type,
			      P_POINT_TYP_NO IN Ias_Point_Typ_Mst.Point_Typ_No%Type,
			      P_Bill_NO      IN NUMBER,
			      P_DOC_AMT      IN NUMBER,
			      P_POINT_CNT    IN NUMBER,
			      P_TRNS_TYPE    IN NUMBER,
			      P_A_CY	     IN VARCHAR2,
			      P_Ac_Rate      IN NUMBER,
			      P_machine_no   IN IAS_POS_MACHINE.MACHINE_NO%TYPE,
			      P_AD_U_ID      IN USER_R.U_ID%TYPE,
			      P_AD_DATE      IN DATE,
			      P_CMP_NO	     IN Pos_Point_Calc_trns.CMP_NO%TYPE,
			      P_BRN_NO	     IN Pos_Point_Calc_trns.BRN_NO%TYPE,
			      P_BRN_YEAR     IN Pos_Point_Calc_trns.BRN_YEAR%TYPE,
			      P_BRN_USR      IN Pos_Point_Calc_trns.BRN_USR%TYPE,
			      P_Bill_Amt     IN NUMBER,
			      P_Yr_Br_Usr    IN VARCHAR2,
			      P_Db_Link      IN VARCHAR2,
			      P_Point_Age_Expired_Typ In Number,
			      P_Point_Age_Expired_Prd In Number) IS
	  V_Point_Amt	  NUMBER;
	  V_Point_Cnt	  NUMBER;
	  V_Expire_Date   Date;
	 Begin

	  V_Expire_Date := Get_Expire_Date (P_Point_Typ_No	    => P_Point_Typ_No,
					    P_Cust_Code 	    => P_Cust_Code,
					    P_Point_Age_Expired_Typ => P_Point_Age_Expired_Typ,
					    P_Point_Age_Expired_Prd => P_Point_Age_Expired_Prd);

	 V_Point_Amt := Get_Point_Rplc_Amt(P_Point_Typ_No => P_Point_Typ_No,P_Point_cnt =>P_Point_Cnt) ;
	 IF P_Db_Link IS NULL THEN
	     Execute Immediate	'Insert Into '||P_Yr_Br_Usr||'.Pos_Point_Calc_trns(
					  TRNS_NO,
					  TRNS_DATE,
					  CUST_CODE,
					  MOBILE_NO,
					  POINT_TYP_NO,
					  Bill_NO,
					  DOC_AMT,
					  POINT_CNT,
					  TRNS_TYPE,
					  A_CY,
					  AC_RATE,
					  machine_no,
					  AD_U_ID,
					  AD_DATE,
					  CMP_NO,
					  BRN_NO,
					  BRN_YEAR,
					  BRN_USR ,
					  Bill_Amt,
					  DOC_NO,
					  DOC_SRL,
					  DOC_TYP,
					  Point_Amt,
					  EXPIRE_DATE,
					  EXTERNAL_POST)
				  Values('||P_TRNS_NO||','''||
					  P_TRNS_DATE||''','''||
					  P_CUST_CODE||''','''||
					  P_MOBILE_NO||''','||
					  P_POINT_TYP_NO||','||
					  P_Bill_NO||','||
					  P_DOC_AMT||','||
					  P_POINT_CNT||','||
					  P_TRNS_TYPE||','''||
					  P_A_CY||''','||
					  P_Ac_Rate||','||
					  P_machine_no||','||
					  P_AD_U_ID||','''||
					  P_AD_DATE||''','||
					  P_CMP_NO||','||
					  P_BRN_NO||','||
					  P_BRN_YEAR||','||
					  P_BRN_USR ||','||
					  P_Bill_Amt||','||
					  P_Bill_NO||','||
					  P_Bill_NO||','||
					  1||','||
					  V_Point_Amt||','''||
					  V_Expire_Date||''','||
					  80||')';
       ELSE
	 Execute Immediate  'Insert Into '||P_Yr_Br_Usr||'.Pos_Point_Calc_trns@'||P_Db_Link||'(
					  TRNS_NO,
					  TRNS_DATE,
					  CUST_CODE,
					  MOBILE_NO,
					  POINT_TYP_NO,
					  Bill_NO,
					  DOC_AMT,
					  POINT_CNT,
					  TRNS_TYPE,
					  A_CY,
					  AC_RATE,
					  machine_no,
					  AD_U_ID,
					  AD_DATE,
					  CMP_NO,
					  BRN_NO,
					  BRN_YEAR,
					  BRN_USR ,
					  Bill_Amt,
					  DOC_NO,
					  DOC_SRL,
					  DOC_TYP,
					  Point_Amt,
					  EXPIRE_DATE,
					  EXTERNAL_POST)
				  Values('||P_TRNS_NO||','''||
					  P_TRNS_DATE||''','''||
					  P_CUST_CODE||''','''||
					  P_MOBILE_NO||''','||
					  P_POINT_TYP_NO||','||
					  P_Bill_NO||','||
					  P_DOC_AMT||','||
					  P_POINT_CNT||','||
					  P_TRNS_TYPE||','''||
					  P_A_CY||''','||
					  P_Ac_Rate||','||
					  P_machine_no||','||
					  P_AD_U_ID||','''||
					  P_AD_DATE||''','||
					  P_CMP_NO||','||
					  P_BRN_NO||','||
					  P_BRN_YEAR||','||
					  P_BRN_USR ||','||
					  P_Bill_Amt||','||
					  P_Bill_NO||','||
					  P_Bill_NO||','||
					  1||','||
					  V_Point_Amt||','''||
					  V_Expire_Date||''','||
					  80||')';
	 END IF;
	 Exception When Others Then
	  IF P_Db_Link IS NULL THEN
	    Raise_application_error(-20001,Ias_Gen_Pkg.Get_Msg(1,2225)||'Error When Inserting into point trns' ||Chr(13)||SqlErrm);
	  ELSE
	    Raise_application_error(-20001,Ias_Gen_Pkg.Get_Msg(1,2225)||'Error When Inserting into point trns server' ||Chr(13)||SqlErrm);
	  END IF;
  End  Insrt_Pos_Point_Trns;
  --##---------------------------------------------------------------------------------##--
  Function Get_Expire_Date ( P_Point_Typ_No	     In Ias_Point_Typ_Mst.Point_Typ_No%Type    ,
			     P_Cust_Code	     In Ias_Cash_Custmr.Cust_Code%Type,
			     P_Point_Age_Expired_Typ In Number ,
			     P_Point_Age_Expired_Prd In Number ) Return Date Is
   V_Expire_Date Date;
 Begin

    If P_Point_Age_Expired_Typ=0 Then
       V_Expire_Date := Ias_Gen_Pkg.Get_Final_Day;
    ElsIf P_Point_Age_Expired_Typ=1 And Nvl(P_Point_Age_Expired_Prd,0)>0 Then
      Begin
	Select ADD_MONTHS(To_date(Point_Typ_Actv_Date,'DD/MM/YYYY'),P_Point_Age_Expired_Prd) into V_Expire_Date
	 From Ias_Cash_Custmr
	Where Cust_code    =P_Cust_Code
	  --And Point_Typ_No =P_Point_Typ_No
	  And RowNum<=1;
      Exception When Others Then
	 V_Expire_Date:=Null;
      End;
    ElsIf P_Point_Age_Expired_Typ=2 And Nvl(P_Point_Age_Expired_Prd,0)>0 Then
      Begin
	Select ADD_MONTHS(To_date(Start_Date,'DD/MM/YYYY'),P_Point_Age_Expired_Prd) into V_Expire_Date
	 From Ias_Point_Typ_Mst
	Where Point_Typ_No =P_Point_Typ_No
	  And RowNum<=1;
      Exception When Others Then
	 V_Expire_Date:=Null;
      End;
    End If;
    Return (V_Expire_Date) ;

  Exception When Others Then
    RETURN (Null);
 End Get_Expire_Date;
  --##---------------------------------------------------------------------------------##--
  FUNCTION Chk_Point_Trns( P_Bill_Date		In Ias_Pos_Bill_Mst.Bill_Date%Type,
			   P_Cust_Code		In Ias_Cash_Custmr.Cust_Code%Type,
			   P_Point_Typ_No	In Ias_Point_Typ_Mst.Point_Typ_No%Type,
			   P_Point_Aprvd_By_Day In Number Default Null,
			   P_Yr_Br_Usr		In Varchar2,
			   P_Db_Link		In Varchar2  ) RETURN NUMBER IS
    V_Point_Cnt Number:=0;
    V_Yr_Br_Usr VARCHAR2(50);
    V_Db_Link	VARCHAR2(50);
  Begin
     -------------------------------------------------------------------------------------
     If P_Yr_Br_Usr Is Not Null Then
       V_Yr_Br_Usr := '.'||P_Yr_Br_Usr;
     End If;
     If P_Db_Link Is Not Null Then
       V_Db_Link := '@'||P_Db_Link;
     End If;
     -------------------------------------------------------------------------------------
     If P_Cust_Code Is Not Null And P_Point_Typ_No Is Not Null Then
	 Begin
	   V_Point_Cnt := Ys_Gen_Pkg.Get_Cnt('Select Sum(Nvl(Point_Cnt,0))
						From '||V_Yr_Br_Usr||'Pos_Point_Calc_trns'||V_Db_Link||'
					       Where Point_Typ_No='||P_Point_Typ_No||'
						 And Cust_Code='''||P_Cust_Code||'''
						 And To_Date(trns_date,''DD/MM/YYYY'')<= Decode(Trns_Type,1,To_Date('''||P_Bill_Date||''',''DD/MM/YYYY'')-'||Nvl(P_Point_Aprvd_By_Day,0)||',To_Date('''||P_Bill_Date||''',''DD/MM/YYYY''))
						 And To_Date(Nvl(Expire_Date,Ias_Gen_Pkg.Get_Curdate),''DD/MM/YYYY'')>=To_Date('''||P_Bill_Date||''',''DD/MM/YYYY'')');
	 Exception When Others Then Null;
	     V_Point_Cnt :=0;
	 End;
     End If;
     -------------------------------------------------------------------------------------
     RETURN (NVL(V_Point_Cnt,0));
     -------------------------------------------------------------------------------------
  Exception When Others Then
	  RETURN (0);
  END Chk_Point_Trns;
  --##---------------------------------------------------------------------------------##--
  FUNCTION Get_bill_doc_amt_point_fnc(P_Point_Typ_No In Number,
				    P_Bill_No  In Number) Return Number is
		V_Point_amt_clc_type Number:=2;
		V_Amt		Number;
		V_Expct_Amt    Number:=0;
		V_itmunt_Expct_frm_pnt_amt  Number:=0;
		V_Net_Bill_Amt		    Number:=0;
		V_bill_rate	Number:=1;
	Begin
  If P_Point_Typ_No Is Not Null Then
   Begin
      Select Point_amt_clc_type Into V_Point_amt_clc_type
	From Ias_point_typ_mst
	Where  Point_Typ_No=P_Point_Typ_No;
    Exception When Others Then
	V_Point_amt_clc_type:=2;
    End;
    Begin
	Select Count(M.Bill_rate),Sum((Nvl(D.I_price,0)-Nvl(D.Dis_amt_dtl,0)-Nvl(D.Dis_amt_mst,0))*Nvl(D.I_qty,0) )
	 Into  V_bill_rate,V_Net_Bill_Amt
      From Ias_Pos_Bill_MST M,Ias_Pos_Bill_dtl D
      Where M.Bill_no=D.Bill_no
	And d.bill_no=p_bill_no;
    Exception When Others Then
	 V_Net_Bill_Amt:=0;
    End;

    Begin
	Select Sum((Nvl(D.I_price,0)-Nvl(D.Dis_amt_dtl,0))*Nvl(D.I_qty,0) ) Into V_itmunt_expct_frm_pnt_amt
    From Ias_itm_dtl M,Ias_Pos_Bill_dtl D
      Where d.bill_no=p_bill_no and M.I_code=D.I_code And M.Itm_unt=D.Itm_unt
	And Nvl(M.Excld_pnt_clc_flg,0)=1 And D.Qt_prm_no Is Null And Nvl(D.Dis_amt_dtl,0)=0;
    Exception When Others Then
	 V_itmunt_expct_frm_pnt_amt:=0;
    End;
    If Nvl(V_Net_Bill_Amt,0)>0 Then
	If NVL(V_bill_rate,0)=0 Then
	   V_bill_rate:=1;
	End If;

	If V_Point_amt_clc_type =0 Then
	    Begin
		Select Sum((Nvl(D.I_price,0)-Nvl(D.Dis_amt_dtl,0)-Nvl(D.Dis_amt_mst,0))*Nvl(D.I_qty,0) ) Into V_Expct_Amt
	    From Ias_Pos_Bill_dtl D
	      Where d.bill_no=p_bill_no And (D.Qt_prm_no Is Not Null Or Nvl(D.Dis_amt_dtl,0)>0 );
	    Exception When Others Then
		 V_Expct_Amt:=0;
	    End;
	    V_Amt:=(Nvl(V_Net_Bill_Amt,0)-Nvl(V_Expct_Amt,0)-Nvl(V_itmunt_expct_frm_pnt_amt,0))*Nvl(V_bill_rate,1);
	Elsif V_Point_amt_clc_type=1 Then
	    Begin
		Select Sum((Nvl(D.I_price,0)-Nvl(D.Dis_amt_dtl,0)-Nvl(D.Dis_amt_mst,0))*Nvl(D.I_qty,0) ) Into V_Expct_Amt
	    From Ias_Pos_Bill_dtl D
	      Where d.bill_no=p_bill_no And Nvl(D.Dis_amt_dtl,0)>0 ;
	    Exception When Others Then
		 V_Expct_Amt:=0;
	    End;
	    V_Amt:=(Nvl(V_Net_Bill_Amt,0)-Nvl(V_Expct_Amt,0)-Nvl(V_itmunt_expct_frm_pnt_amt,0) )*Nvl(V_bill_rate,1);
	Else
	    V_Amt:=(Nvl(V_Net_Bill_Amt,0)-Nvl(V_itmunt_expct_frm_pnt_amt,0) )*Nvl(V_bill_rate,1);
	End If;
    End If;
   End If;
	 If V_AMT>0 Then
		Return (V_AMT);
	 Else
		Return (0);
	 End If;
 End Get_bill_doc_amt_point_fnc;
  --##---------------------------------------------------------------------------------##--
End Pos_Point_Pkg;
/
