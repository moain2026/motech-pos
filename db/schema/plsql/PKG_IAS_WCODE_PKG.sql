-- =============================================
-- PACKAGE SPEC: IAS_WCODE_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE IAS_Wcode_Pkg as
 FUNCTION Get_Wc_Nm  ( P_W_code In WAREHOUSE_DETAILS.W_CODE%TYPE,P_Lng_no In Number) Return VARCHAR2;
 FUNCTION Get_Wc_St  ( P_W_code In WAREHOUSE_DETAILS.W_CODE%TYPE) Return NUMBER;
 FUNCTION Get_Wc_Ser ( P_W_code In WAREHOUSE_DETAILS.W_CODE%TYPE) Return NUMBER;
 FUNCTION Get_Wc_cc  ( P_W_code In WAREHOUSE_DETAILS.W_CODE%TYPE) Return VARCHAR2;
 FUNCTION Get_Wc_Brn ( P_W_code In WAREHOUSE_DETAILS.W_CODE%TYPE ) Return NUMBER ;

 FUNCTION Chk_Wc_Brn ( P_W_code In WAREHOUSE_DETAILS.W_CODE%TYPE, P_BRN_NO In S_BRN.BRN_NO%TYPE ) Return NUMBER;
 Function Get_Whg_Code	( P_W_Code In Warehouse_Details.W_Code%Type ) Return Number ;
 FUNCTION Chk_Wc_Unt_Sale_Typ (P_W_code  In Warehouse_Details.W_Code%TYPE
			      ,P_I_Code  In Ias_Itm_Mst.I_Code%Type
			      ,P_Itm_Unt In Ias_Itm_Dtl.Itm_Unt%Type
			      ,P_Lang_No In Number
			      ) Return VARCHAR2;
End IAS_Wcode_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_WCODE_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE Body IAS_Wcode_Pkg as

--================================================================
FUNCTION Get_Wc_Nm  ( P_W_code In WAREHOUSE_DETAILS.W_CODE%TYPE,P_Lng_no In Number) Return VARCHAR2 Is
  v_name varchar2(60);
 Begin
	
	 Select Decode(P_Lng_no,1,w_name,nvl(w_e_name,w_name))
	   Into v_name
	   From WAREHOUSE_DETAILS
	  where W_code = P_W_code
	    and RowNum<=1;
	
	 Return(v_name);
	
 Exception
	when others then
	  Return(Null);
End Get_Wc_Nm ;
--================================================================
FUNCTION Get_Wc_St  ( P_W_code In WAREHOUSE_DETAILS.W_CODE%TYPE) Return NUMBER Is
  v_inc Number;
 Begin
	
	 Select nvl(INACTIVE,0)
	   Into v_inc
	   From WAREHOUSE_DETAILS
	  where W_code = P_W_code
	    and RowNum<=1;
	
	 Return(v_inc);
	
 Exception
	when others then
	  Return(0);
End Get_Wc_St ;
--================================================================
FUNCTION Get_Wc_Ser  ( P_W_code In WAREHOUSE_DETAILS.W_CODE%TYPE) Return NUMBER Is
  v_ser Number;
 Begin
	
	 Select nvl(w_ser,0)
	   Into v_ser
	   From WAREHOUSE_DETAILS
	  where W_code = P_W_code
	    and RowNum<=1;
	
	 Return(v_ser);
	
 Exception
	when others then
	  Return(0);
End Get_Wc_Ser ;
--================================================================
FUNCTION Get_Wc_cc  ( P_W_code In WAREHOUSE_DETAILS.W_CODE%TYPE) Return VARCHAR2 Is
  v_cc VARCHAR2 (30);
 Begin
	
	 Select cc_code
	   Into v_cc
	   From WAREHOUSE_DETAILS
	  where W_code = P_W_code
	    and RowNum<=1;
	
	 Return(v_cc);
	
 Exception
	when others then
	  Return(Null);
End Get_Wc_cc ;
--===============================================================
FUNCTION Get_Wc_Brn  ( P_W_code In WAREHOUSE_DETAILS.W_CODE%TYPE ) Return NUMBER Is
  v_brn_no Number;
Begin
	
	 Select Conn_Brn_No
	   Into v_brn_no
	   From WAREHOUSE_DETAILS
	  where W_code = P_W_code
	    and RowNum<=1;
	
	 Return(v_brn_no);
	
 Exception
	when others then
	  Return(Null);
End Get_Wc_Brn ;
--===============================================================
FUNCTION Chk_Wc_Brn  ( P_W_code In WAREHOUSE_DETAILS.W_CODE%TYPE, P_BRN_NO In S_BRN.BRN_NO%TYPE ) Return NUMBER Is
  v_cnt Number;
 Begin
	
	 Select 1
	   Into v_cnt
	   From WAREHOUSE_DETAILS
	  where W_code = P_W_code
      and Conn_Brn_No = P_BRN_NO
	    and RowNum<=1;
	
	 Return(v_cnt);
	
 Exception
	when others then
	  Return(0);
End Chk_Wc_Brn ;
--===============================================================
Function Get_Whg_Code  ( P_W_Code In Warehouse_Details.W_Code%Type ) Return Number Is
  V_Whg_Code Warehouse_Details.Whg_Code%Type ;
Begin
     Select Whg_Code
       Into V_Whg_Code
      From Warehouse_Details
       Where W_Code = P_W_Code
	 And Rownum<=1;

     Return(V_Whg_Code);

 Exception
    When Others Then
      Return(Null);
End Get_Whg_Code ;
--===============================================================
FUNCTION Chk_Wc_Unt_Sale_Typ (P_W_code	In Warehouse_Details.W_Code%TYPE
			     ,P_I_Code	In Ias_Itm_Mst.I_Code%Type
			     ,P_Itm_Unt In Ias_Itm_Dtl.Itm_Unt%Type
			     ,P_Lang_No In Number
			     ) Return VARCHAR2
Is
  V_Cnt Number:=0;
  V_Unt_Sale_Typ  Measurement.Unt_Sale_Typ%Type;
  V_Wcode_Sale_Typ  Warehouse_Details.Wcode_Sale_Typ%Type;
  V_Msg_Txt Varchar2(4000);
  V_Unt_Flg_Desc   Varchar2(50);
  V_Wcode_Flg_Desc Varchar2(50);
  V_Use_Wholesale_Retail_Flg Ias_Para_Inv.Use_Wholesale_Retail_Flg%Type;
Begin
    Begin
	Select Nvl(Use_Wholesale_Retail_Flg,0) Into V_Use_Wholesale_Retail_Flg
	From Ias_Para_Inv
	Where Rownum <=1;
    Exception
    When Others Then
	V_Use_Wholesale_Retail_Flg := 0;
    End;

    If Nvl(V_Use_Wholesale_Retail_Flg,0) = 1 Then
	Begin
	    Select 1 Into V_Cnt
	    From Ias_Itm_Dtl
	    Where I_Code = P_I_Code;
	Exception
	When Too_Many_Rows Then
	    V_Cnt := 0;
	When Others Then
	    V_Msg_Txt := Ias_Gen_Pkg.Get_Msg(P_Lang_No,530) || ' , '||Sqlerrm;
	    V_Cnt := 1;
	End;

	If Nvl(V_Cnt,0) = 0 And P_W_code Is Not Null And P_Itm_Unt Is Not Null Then
	    Begin
		Select Unt_Sale_Typ Into V_Unt_Sale_Typ
		From Measurement
		Where Measure_Code = P_Itm_Unt;
	    Exception When Others Then
		V_Unt_Sale_Typ := 0;
	    End;

	    Begin
		Select Wcode_Sale_Typ Into V_Wcode_Sale_Typ
		From Warehouse_Details
		Where W_Code = P_W_code;
	    Exception When Others Then
		V_Wcode_Sale_Typ := 0;
	    End;

	    --V_Unt_Sale_Typ = 1 => Retail
	    --V_Unt_Sale_Typ = 2 => Wholesale
	    --V_Unt_Sale_Typ = 2 => Wholesale And Retail

	    --V_Wcode_Sale_Typ = 1 => Retail
	    --V_Wcode_Sale_Typ = 2 => Wholesale
	    --V_Wcode_Sale_Typ = 2 => Wholesale And Retail

	    If Nvl(V_Unt_Sale_Typ,0) = 0 Or Nvl(V_Wcode_Sale_Typ,0) = 0 Then
	       V_Msg_Txt := Ias_Gen_Pkg.Get_Msg(P_Lang_No,530); -- Error Occured
	    Elsif Nvl(V_Unt_Sale_Typ,0) = 1 And Nvl(V_Wcode_Sale_Typ,0) = 2 Then
		Begin
		    Select Flg_Desc Into V_Unt_Flg_Desc From S_Flags
		    Where Lang_No = P_Lang_No
		     And Flg_Value = Nvl(V_Unt_Sale_Typ,0)
		     And Flg_Code ='INV_SALE_TYP';
		Exception
		When Others Then
		    V_Unt_Flg_Desc := Null;
		End;

		Begin
		    Select Flg_Desc Into V_Wcode_Flg_Desc From S_Flags
		    Where Lang_No = P_Lang_No
		     And Flg_Value = Nvl(V_Wcode_Sale_Typ,0)
		     And Flg_Code ='INV_SALE_TYP';
		Exception
		When Others Then
		    V_Wcode_Flg_Desc := Null;
		End;

		V_Msg_Txt := Ias_Gen_Pkg.Get_Msg(P_Lang_No,6889)||' = '||V_Unt_Flg_Desc||Chr(13)||Ias_Gen_Pkg.Get_Msg(P_Lang_No,6891)||' = '||V_Wcode_Flg_Desc ;

	    Elsif Nvl(V_Unt_Sale_Typ,0) = 2 And Nvl(V_Wcode_Sale_Typ,0) = 1 Then
		Begin
		    Select Flg_Desc Into V_Unt_Flg_Desc From S_Flags
		    Where Lang_No = P_Lang_No
		     And Flg_Value = Nvl(V_Unt_Sale_Typ,0)
		     And Flg_Code ='INV_SALE_TYP';
		Exception
		When Others Then
		    V_Unt_Flg_Desc := Null;
		End;
		Begin
		    Select Flg_Desc Into V_Wcode_Flg_Desc From S_Flags
		    Where Lang_No = P_Lang_No
		     And Flg_Value = Nvl(V_Wcode_Sale_Typ,0)
		     And Flg_Code ='INV_SALE_TYP';
		Exception
		When Others Then
		    V_Wcode_Flg_Desc := Null;
		End;
		V_Msg_Txt := Ias_Gen_Pkg.Get_Msg(P_Lang_No,6889)||' = '||V_Unt_Flg_Desc||Chr(13)||Ias_Gen_Pkg.Get_Msg(P_Lang_No,6891)||' = '||V_Wcode_Flg_Desc ;
	    Else
		V_Msg_Txt := Null; -- Accepted
	    End If;
	End If;
    End If;
    Return(V_Msg_Txt);

Exception When Others Then
    Return(Ias_Gen_Pkg.Get_Msg(P_Lang_No,530) || ' , '||Sqlerrm);
End Chk_Wc_Unt_Sale_Typ;
--===============================================================
End IAS_Wcode_Pkg;
/
