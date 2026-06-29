-- =============================================
-- PACKAGE SPEC: IAS_ITM_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
Package IAS_Itm_Pkg as
 PROCEDURE Get_Itm_Name (P_Lng_no In Number,P_icode  In Ias_Itm_Mst.I_CODE%TYPE,P_i_name Out varchar2,P_idesc Out varchar2) ;
 FUNCTION  Get_Itm_Name (p_i_code In Ias_Itm_Mst.I_CODE%TYPE, P_Lng_no In Number)  RETURN VARCHAR2 ;
 PROCEDURE Get_Itm_Info (  P_Lng_no   In  Number,
				 P_icode    In	Ias_Itm_Mst.I_CODE%TYPE,
													 P_i_name   Out varchar2,
													 P_idesc    Out varchar2,
													 P_UseExpDt Out Number,
													 P_UseBtch  Out Number,
													 P_UseSer   Out Number,
													 P_UseFrc   Out Number,
													 P_UseFree  Out Number,
													 P_UseDisc  Out Number,
													 P_Srv_Itm  Out Number,
													 P_Kit_Itm  Out Number,
													 P_Blocked  Out Number);
 FUNCTION Get_Grand_Avlqty(P_icode In Ias_Itm_Mst.I_CODE%TYPE,
			   P_Wcode In WAREHOUSE_DETAILS.W_CODE%TYPE Default Null) Return NUMBER;
 FUNCTION Get_Grand_Wtavg(P_Wtavg_Type In NUMBER,
			  P_Icode  In Ias_Itm_Mst.I_CODE%TYPE Default Null,
			  P_Wcode  In WAREHOUSE_DETAILS.W_CODE%TYPE Default Null) Return NUMBER;
 FUNCTION Check_Srv_Itm(P_icode    In Ias_Itm_Mst.I_CODE%TYPE) Return NUMBER;
 FUNCTION Check_Kit_Itm(P_icode    In Ias_Itm_Mst.I_CODE%TYPE) Return NUMBER;

FUNCTION Check_NoSale_Itm(P_Icode   In Ias_Itm_Dtl.I_CODE%TYPE ,
			  P_Itm_Unt In Ias_Itm_Dtl.Itm_Unt%TYPE) Return NUMBER ;
 FUNCTION Check_Itm_Wcode_Inactv (P_I_code In Ias_Itm_Mst.I_CODE%TYPE,P_w_code In Warehouse_details.W_CODE%TYPE) RETURN NUMBER ;
 PROCEDURE Get_I_Code( P_Barcode In IAS_ITM_UNT_BARCODE.BARCODE%TYPE ,P_I_Code IN OUT Ias_Itm_Mst.I_Code%Type ,P_Itm_Unt IN OUT Ias_Itm_Dtl.Itm_Unt%Type) ;

 Function Fetch_Itm_Nm_Price_Order (P_I_Code In Ias_Itm_Mst.I_Code%Type )Return Varchar2 ;

	FUNCTION Get_MaxGrand_Size ( P_icode   In Ias_Itm_Mst.I_CODE%TYPE) return NUMBER;
	Function Get_Itm_Activity (P_I_Code   In Ias_Itm_Mst.I_Code%Type ) Return Number ;
	PROCEDURE Get_Itm_Activity_Wcode_Info (P_W_Code       In  Warehouse_Details.W_Code%Type       ,
					       P_Itm_Actv_No  In  Ias_Items_Activity.Activity_No%Type ,
					       P_Cc_Code      Out Cost_Centers.Cc_Code%Type	      ,
					       P_Pj_No	      Out Ias_Projects.Pj_No%Type	      ,
					       P_Actv_No      Out Ias_Actvty.Actv_No%Type	      ) ;

  Function Get_Icode_One_Unit (P_I_Code  In Ias_Itm_Mst.I_Code%Type) Return Ias_Itm_Dtl.Itm_Unt%Type ;
  Function Get_Icode_Unit_By_Lvl (P_I_Code  In Ias_Itm_Mst.I_Code%Type , P_Lvl_Unit In Ias_Itm_Dtl.Lvl_Unit%Type) Return Ias_Itm_Dtl.Itm_Unt%Type;
  Function Chk_Icode_Unit (P_I_Code  In Ias_Itm_Mst.I_Code%Type    ,
			     P_Itm_Unt In Ias_Itm_Dtl.Itm_Unt%Type   ) Return Number ;
  Function Get_Icode_Min_Unit (P_I_Code    In Ias_Itm_Mst.I_Code%Type ) Return Ias_Itm_Dtl.Itm_Unt%Type ;
  Function Get_Icode_Purch_Unit (P_I_Code In Ias_Itm_Mst.I_Code%Type ) Return Ias_Itm_Dtl.Itm_Unt%Type;
  Function Get_Icode_Sales_Unit (P_I_Code In Ias_Itm_Mst.I_Code%Type ) Return Ias_Itm_Dtl.Itm_Unt%Type;
  --##----------------------------------------------------------------------------------------------##--
  Function Get_Icode_Size_Unit (P_I_Code    In Ias_Itm_Mst.I_Code%Type ,P_Itm_Unt In Ias_Itm_Dtl.Itm_Unt%Type) Return Number;
  --##----------------------------------------------------------------------------------------------##--
  Procedure Get_Itm_QR_Code_Data (P_QR_Code_Itm 	     In  Varchar2 ,
				  P_QR_Code_Prfx_Lngth	     In  Number   ,
				  P_QR_Code_Lngth	     In  Number   ,
				  P_QR_Code_Argmnt	     In  Number   ,
				  P_No_Of_Barcode_In_QR_Code In  Number   ,
				  P_Itm_Code		     Out Ias_Itm_Mst.I_Code%Type );
  --##----------------------------------------------------------------------------------------------##--
   Procedure Get_Itm_Wght_Data ( P_Itm_Barcode		     In  Ias_Itm_Dtl.Barcode%Type ,
				  P_Wght_Prfx		  In  Varchar2		       ,
				  P_Wght_Lngth		  In  Number		       ,
				  P_Wght_Itm_Lngth	  In  Number		       ,
				  P_Wght_Val		  In  Number		       ,
				  P_Wght_Val_Srvc	  In  Number		       ,
				  P_Remove_Wght_Dgt	  In  Number		       ,
				  P_Incld_Itm_Unt	  In  Number Default 0	       ,
				  P_Itm_Code		  Out Ias_Itm_Mst.I_Code%Type  ,
				  P_Itm_Qty		  Out Number		       ,
				  P_Itm_Unt		  Out Ias_Itm_Dtl.Itm_Unt%Type ,
				  P_Wght_Srvc_Itm_Price   Out Number) ;
  --##----------------------------------------------------------------------------------------------##--
   Procedure Get_Itm_Wght_Data ( P_Itm_Barcode		 In  Ias_Itm_Dtl.Barcode%Type ,
				  P_Wght_Prfx		  In  Varchar2		       ,
				  P_Wght_Lngth		  In  Number		       ,
				  P_Wght_Itm_Lngth	  In  Number		       ,
				  P_Wght_Val		  In  Number		       ,
				  P_Wght_Val_Srvc	  In  Number		       ,
				  P_Remove_Wght_Dgt	  In  Number		       ,
				  P_Incld_Itm_Unt	  In  Number Default 0	       ,
				  P_clc_qty_by_incld_price  In	Number		       ,
				  P_wght_price_frc_lngth  In  Number		       ,
				  P_Itm_Price		  In  Number		       ,
				  P_Itm_Code		  Out Ias_Itm_Mst.I_Code%Type  ,
				  P_Itm_Qty		  Out Number		       ,
				  P_Itm_Unt		  Out Ias_Itm_Dtl.Itm_Unt%Type ,
				  P_Wght_Srvc_Itm_Price   Out Number,
				  P_USE_WGHT_INCLD_PRC	  In  NUMBER   default null,
				  P_WGHT_PRC_PRFX	  In  VARCHAR2 default null,
				  P_WGHT_PRC_BRCDE_LNGTH  In  NUMBER   default null,
				  P_RMOVE_WGHT_PRC_DGT	  In  NUMBER   default null,
				  P_CUR_FRC_NO		  In  NUMBER   default 1
				  );
--##----------------------------------------------------------------------------------------------##--
Function Get_Max_Lvl_Unt (P_I_Code    In Ias_Itm_Mst.I_Code%Type) Return Ias_Itm_Dtl.Lvl_Unit%Type;
Function Get_Icode_By_GTIN_Code(P_GTIN_Code  In Ias_Itm_Mst.GTIN_Code%Type ) Return Varchar2;
Function Get_GTIN_Code (P_I_Code   In Ias_Itm_Mst.I_Code%Type ) Return Varchar2 ;
Function Get_Itm_Price_Docacy ( P_Icode 		       In Ias_Itm_Mst.I_Code%Type,
				P_Itm_Unt		       In Ias_Itm_Dtl.Itm_Unt%Type,
				P_Acy			       In Varchar2,
				P_Loc_Cur		       In Varchar2,
				P_Stk_Cur		       In Varchar2,
				P_Ac_Rate		       In Number,
				P_Stk_Rate		       In Number,
				P_Lev_No			 In Number,
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
				P_Itm_Use_Price_BtchNo_Optnl   In Number    Default 0,
				P_Usr_No		       In User_R.U_Id%Type    ) RETURN NUMBER;
Function Get_Icode_Unt	(P_I_Code In Ias_Itm_Mst.I_Code%Type  ,P_Unt_Type  In  Number,P_Lvl_Unt In Number Default Null) Return Varchar2 ;
Function Get_Itm_Unt_Lvl ( P_I_Code In	Ias_Itm_Mst.I_Code%Type , P_Lvl_Unit In Ias_Itm_Dtl.Lvl_Unit%Type  ) Return Varchar2 ;
Function Get_Icode_Trns_Unit (P_I_Code In Ias_Itm_Mst.I_Code%Type ) Return Ias_Itm_Dtl.Itm_Unt%Type;
End  IAS_ITM_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_ITM_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
Package Body IAS_Itm_Pkg as
-----------------------------------------------------------
PROCEDURE Get_Itm_Name (P_Lng_no In Number,P_icode  In Ias_Itm_Mst.I_CODE%TYPE,P_i_name Out varchar2,P_idesc Out varchar2) IS
Begin
   Select Decode(P_lng_no,1,nvl(I_name,I_e_name),nvl(I_e_name,I_name)),i_desc
     Into P_i_name,P_idesc
     From Ias_Itm_Mst
    Where i_code=P_icode;
 Exception
  When Others Then
	  --Raise_Application_Error(-20410,'Item Code Is Invalid = '||SqlErrm) ;
	  Raise_application_error(-20410,Ias_Gen_Pkg.Get_Msg(P_Lng_No,46)||' ,'||SqlErrm);
End Get_Itm_Name;
------------------------------------------------------------
FUNCTION  Get_Itm_Name (p_i_code  In Ias_Itm_Mst.I_CODE%TYPE, P_Lng_no In Number)  RETURN VARCHAR2 IS
 V_ITM_NM Ias_Itm_Mst.I_name%TYPE ;
Begin
   Select Decode(P_lng_no,1,I_name,nvl(I_e_name,I_name))
     Into V_ITM_NM
     From Ias_Itm_Mst
    Where i_code=p_i_code
     and Rownum<=1;

    RETURN(V_ITM_NM);

Exception
  When Others Then
	  RETURN(NULL);
End Get_Itm_Name;
------------------------------------------------------------
PROCEDURE Get_Itm_Info ( P_Lng_no   In	Number,
			 P_icode    In	Ias_Itm_Mst.I_CODE%TYPE,
												 P_i_name   Out varchar2,
												 P_idesc    Out varchar2,
												 P_UseExpDt Out Number,
												 P_UseBtch  Out Number,
												 P_UseSer   Out Number,
												 P_UseFrc   Out Number,
												 P_UseFree  Out Number,
												 P_UseDisc  Out Number,
												 P_Srv_Itm  Out Number,
												 P_Kit_Itm  Out Number,
												 P_Blocked  Out Number) IS
Begin
   Select Decode(P_lng_no,1,nvl(I_name,I_e_name),nvl(I_e_name,I_name)),i_desc,
	  nvl(Use_Exp_date,0),nvl(Use_batch_no,0),nvl(Use_Serialno,0),
	  nvl(Use_Qty_Fraction,0),nvl(Allow_Free_Qty,0),nvl(Allow_Disc,0),
	  nvl(Service_Itm,0),nvl(Kit_Itm,0),nvl(Blocked,0)
     Into P_i_name,P_idesc,P_UseExpDt ,
					P_UseBtch, P_UseSer, P_UseFrc,P_UseFree,P_UseDisc,P_Srv_Itm  ,
	  P_Kit_Itm,P_Blocked
     From Ias_Itm_Mst
    Where i_code=P_icode;
 Exception
  When others then
	  --Raise_Application_Error(-20411,'Item Code Is Invalid = '||SqlErrm) ;
	  Raise_application_error(-20411,Ias_Gen_Pkg.Get_Msg(P_Lng_No,46)||' ,'||SqlErrm);
End Get_Itm_Info ;

-----------------------------------------------------------
FUNCTION Get_Grand_Avlqty( P_Icode In Ias_Itm_Mst.I_CODE%TYPE,
			   P_Wcode In WAREHOUSE_DETAILS.W_CODE%TYPE Default null) Return NUMBER Is
 avlq NUMBER;
Begin

If  P_wcode Is Null Then
    Select Sum(avlq)
      Into avlq
      From ( Select sum(distinct Avl_qty) avlq,w_code
	       From Ias_Itm_Wcode
	      Where Ias_Itm_Wcode.I_Code = P_Icode
	       And  Ias_Itm_Wcode.P_Size = 1
	      group by	w_code	);

Else
    Select Sum(distinct  Avl_qty)
      Into avlq  From Ias_Itm_Wcode
     where Ias_Itm_Wcode.I_Code = P_Icode
       And Ias_Itm_Wcode.P_Size = 1
       And W_code=P_wcode;
End If;

 Return(Nvl(avlq,0));
Exception
When others then
 Return(0);
End Get_Grand_Avlqty;
-----------------------------------------------------------
 FUNCTION Get_Grand_Wtavg( P_Wtavg_Type In NUMBER,
			   P_Icode	In Ias_Itm_Mst.I_CODE%TYPE Default Null,
			   P_Wcode	In WAREHOUSE_DETAILS.W_CODE%TYPE   Default Null ) Return NUMBER Is
   v_Wtavg  NUMBER;
 Begin

   If P_Icode Is Not Null Then
	     Begin
		  	  If P_Wtavg_Type = 1 Then  --By Item
		  	  	  Select nvl(i_cwtavg,0)
				  	    Into v_Wtavg
				  	    From Ias_Itm_Mst
					       Where i_code = P_Icode;
		  	  ElsIf P_Wtavg_Type = 2  Then	--By Item + W_Code
				  	  Select nvl(i_cwtavg,0)
				  	    Into v_Wtavg
				  	    From Ias_Itm_Wcode
					       Where i_code  = P_Icode
						 And w_code  = P_Wcode
						 And  P_Size = 1 ;
		ElsIf P_Wtavg_Type = 3 Then  -- By Item + Whg_Code
	       Begin
		  Select Nvl(I_Cwtavg,0)
		    Into V_Wtavg
		   From Ias_Itm_Wcode
		    Where I_Code    = P_Icode
		     And  Whg_Code  = Ias_Wcode_Pkg.Get_Whg_Code  (P_Wcode)
		     And  P_Size    = 1
		     And  Rownum   <= 1  ;
	       Exception
		   When No_Data_Found Then
		      V_Wtavg := 0 ;
		   When Others Then
		      Raise_Application_Error(-20411,'Error In Get Wtavg For I_Code '||P_Icode||Sqlerrm);
	       End ;				
				  End If;
	      Exception when others then
		--Raise_application_error(-20412,Ias_Gen_Pkg.Get_Msg(P_Lng_No,46)||' ,'||SqlErrm);
		Raise_Application_Error(-20412,'Error In get wtavg for i_code '||P_Icode||SqlErrm);
		   End;
	
   End If;

    return(v_Wtavg);
    Exception
    when others then
    Return(0);
 End  Get_Grand_Wtavg;
-------------------------------------------------------------------------------------------
FUNCTION Check_Srv_Itm(P_icode In Ias_Itm_Mst.I_CODE%TYPE) Return NUMBER Is
 Cnt Number;
Begin

 Select 1
   Into Cnt
   From Ias_Itm_Mst
  where i_code	= P_icode
    and Service_Itm = 1
    and RowNum <=1;

  Return(Cnt);
 Exception
 when No_Data_Found Then
    Return(0);
 when Others Then
    Raise_ApplICation_Error(-20413,'Error In Check_Srv_Itm ' || '' || SqlErrm);
End  Check_Srv_Itm;
--------------------------------------------------------------------------------------
FUNCTION Check_Kit_Itm(P_icode In Ias_Itm_Mst.I_CODE%TYPE) Return NUMBER Is
 Cnt Number;
Begin

 Select 1
   Into Cnt
   From Ias_Itm_Mst
  where i_code	= P_icode
    and Kit_Itm = 1
    and RowNum	<=1;

  Return(Cnt);
 Exception
 when No_Data_Found Then
    Return(0);
 when Others Then
    Raise_ApplICation_Error(-20414,'Error In Check_Kit_Itm ' || '' || SqlErrm);
End  Check_Kit_Itm;
--------------------------------------------------------------------------------------

FUNCTION Check_NoSale_Itm(P_Icode   In Ias_Itm_Dtl.I_CODE%TYPE ,
			  P_Itm_Unt In Ias_Itm_Dtl.Itm_Unt%TYPE) Return NUMBER Is
 Cnt Number;
Begin

 Select 1
   Into Cnt
   From Ias_Itm_Dtl
  where I_Code	= P_Icode
    And Itm_Unt  = P_Itm_Unt
    And No_Sale = 1
    And RowNum	<=1;

  Return(Cnt);
 Exception
 when No_Data_Found Then
    Return(0);
 when Others Then
    Raise_ApplICation_Error(-20415,'Error In Check_NoSale_Itm ' || '' || SqlErrm);
End  Check_NoSale_Itm;
--------------------------------------------------------------------------------------
FUNCTION  Check_Itm_Wcode_Inactv (P_I_code In Ias_Itm_Mst.I_CODE%TYPE,P_w_code In Warehouse_details.W_CODE%TYPE) RETURN NUMBER Is
 v_Inactv  Number;
Begin
  Select nvl(Inactive,0)
    Into v_Inactv
    From Ias_Itm_wcode
   Where i_code = P_i_code
     and w_code = P_w_code
     and RowNum<=1;

     Return(v_Inactv);
 Exception When Others Then
    Return(0);
End Check_Itm_Wcode_Inactv;
--------------------------------------------------------------------------------------
PROCEDURE Get_I_Code( P_Barcode In IAS_ITM_UNT_BARCODE.BARCODE%TYPE ,P_I_Code IN OUT Ias_Itm_Mst.I_Code%Type ,P_Itm_Unt IN OUT Ias_Itm_Dtl.Itm_Unt%Type) Is
  v_icode varchar2(30);
 Begin
	 select I_Code ,Itm_Unt
	   Into P_I_Code,P_Itm_Unt
	   From Ias_Itm_Unt_Barcode
	  where Barcode=P_Barcode;
	
 Exception
	when others then
	 Begin
	 Select I_Code, Itm_Unt
	  Into P_I_Code, P_Itm_Unt
	 From Ias_Itm_Dtl
	  Where Barcode = P_Barcode
	  and Barcode<>i_code;
   Exception
     When Others Then
       Null;
   End;
End Get_I_Code ;
--------------------------------------------------------------------------------------
Function Fetch_Itm_Nm_Price_Order (P_I_Code In Ias_Itm_Mst.I_Code%Type )Return Varchar2 Is
   V_I_Nm   Ias_Itm_Mst.I_Name%Type ;
 Begin
   Select Decode(1,1,Nvl(I_Name,I_E_Name),Nvl(I_E_Name,I_Name)) I_Name
     Into V_I_Nm
    From Ias_Itm_Mst
     Where I_Code = P_I_Code ;
   Return(V_I_Nm);
 Exception
     When Others Then
      Return(Null);
 End ;


FUNCTION Get_MaxGrand_Size ( P_icode  In Ias_Itm_Mst.I_CODE%TYPE) return NUMBER is
  v_gsize  NUMBER;
Begin
 select max(P_Size) into v_gsize  From Ias_Itm_Dtl where I_Code= P_Icode ;
   return(v_gsize);
exception when	others then
  return(1);
End Get_MaxGrand_Size ;

Function Get_Itm_Activity (P_I_Code   In Ias_Itm_Mst.I_Code%Type ) Return Number Is
   V_Actv_No Ias_Items_Activity.Activity_No%Type ;
 Begin
    Select Activity_No
     Into V_Actv_No
    From Ias_Itm_Mst
     Where I_Code = P_I_Code ;
    Return(V_Actv_No) ;
 Exception
  When Others Then
   Return(Null);
 End ;
PROCEDURE Get_Itm_Activity_Wcode_Info (P_W_Code       In  Warehouse_Details.W_Code%Type       ,
				       P_Itm_Actv_No  In  Ias_Items_Activity.Activity_No%Type ,
				       P_Cc_Code      Out Cost_Centers.Cc_Code%Type	      ,
				       P_Pj_No	      Out Ias_Projects.Pj_No%Type	      ,
				       P_Actv_No      Out Ias_Actvty.Actv_No%Type	      ) Is
 Begin
    Select Cc_Code ,
	   Pj_No   ,
	   Actv_No
     Into  P_Cc_Code ,
	   P_Pj_No   ,
	   P_Actv_No
   From   Ias_Conn_Wcode_By_Activity
    Where W_Code      = P_W_Code
      And Activity_No = P_Itm_Actv_No  ;
 Exception
  When Others Then
   P_Cc_Code := Null ;
   P_Pj_No   := Null ;
   P_Actv_No := Null ;
 End Get_Itm_Activity_Wcode_Info ;	
--##----------------------------------------------------------------------------------------------##--	
Function Get_Icode_One_Unit (P_I_Code  In Ias_Itm_Mst.I_Code%Type) Return Ias_Itm_Dtl.Itm_Unt%Type Is
  V_Itm_Unt Ias_Itm_Dtl.Itm_Unt%Type;
 Begin
     Select Itm_Unt Into V_Itm_Unt
      From Ias_Itm_Dtl
       Where Ias_Itm_Dtl.I_Code  = P_I_Code;
     Return(V_Itm_Unt);
 Exception
   When Others Then
     Return (Null);

 End Get_Icode_One_Unit ;
--##----------------------------------------------------------------------------------------------##--
Function Get_Icode_Unit_By_Lvl (P_I_Code  In Ias_Itm_Mst.I_Code%Type , P_Lvl_Unit In Ias_Itm_Dtl.Lvl_Unit%Type) Return Ias_Itm_Dtl.Itm_Unt%Type Is
  V_Itm_Unt Ias_Itm_Dtl.Itm_Unt%Type;
 Begin
     Select Itm_Unt Into V_Itm_Unt
       From Ias_Itm_Dtl
      Where Ias_Itm_Dtl.I_Code	= P_I_Code
	And Lvl_Unit=P_Lvl_Unit
	And RownuM<=1;
     Return(V_Itm_Unt);
 Exception
   When Others Then
     Return (Null);

 End Get_Icode_Unit_By_Lvl ;
--##----------------------------------------------------------------------------------------------##--
Function Chk_Icode_Unit ( P_I_Code  In Ias_Itm_Mst.I_Code%Type	  ,
			  P_Itm_Unt In Ias_Itm_Dtl.Itm_Unt%Type   ) Return Number Is
   V_Cnt    Number := 1 ;
   V_Inactv Number := 0 ;
 Begin
			 Begin
			     Select Inactive Into V_Inactv
			       From Ias_Itm_Dtl
			      Where Ias_Itm_Dtl.I_Code	= P_I_Code
				And Ias_Itm_Dtl.Itm_Unt = P_Itm_Unt
				And RowNum	       <= 1 ;
			 Exception
			   /*When No_Data_Found Then
			     V_Cnt := 0 ;
			   When Too_Many_Rows Then
			     V_Cnt := 1 ;*/
			   When Others Then
			     V_Cnt := 0 ;
			 End ;
			 If Nvl(V_Cnt,0) = 0 Then
			    Return (44);
			 ElsIf Nvl(V_Inactv,0) = 1 Then
			 	Return (377);
	     Else
		Return (Null);
			 End If ;
 End Chk_Icode_Unit ;
--##----------------------------------------------------------------------------------------------##--
Function Get_Icode_Min_Unit (P_I_Code	 In Ias_Itm_Mst.I_Code%Type ) Return Ias_Itm_Dtl.Itm_Unt%Type Is
  V_Itm_Unt Ias_Itm_Dtl.Itm_Unt%Type ;
 Begin
     Select Itm_Unt Into V_Itm_Unt
      From Ias_Itm_Dtl
       Where Ias_Itm_Dtl.I_Code        = P_I_Code
	 And Nvl(Ias_Itm_Dtl.P_Size,0) = 1
	 And RowNum		      <= 1 ;
     Return(V_Itm_Unt);
 Exception
   When Others Then
     Return (Null);

 End Get_Icode_Min_Unit ;
--##----------------------------------------------------------------------------------------------##--
Function Get_Icode_Sales_Unit (P_I_Code In Ias_Itm_Mst.I_Code%Type ) Return Ias_Itm_Dtl.Itm_Unt%Type Is
  V_Itm_Unt Ias_Itm_Dtl.Itm_Unt%Type ;
 Begin
     --------------------------------------------------------
     Begin
	Select Itm_Unt Into V_Itm_Unt
      From Ias_Itm_Dtl
       Where Ias_Itm_Dtl.I_Code = P_I_Code
	 And Nvl(Ias_Itm_Dtl.No_Sale,0)=0;
     Exception When Others Then
	V_Itm_Unt := Null;
     End;
     --------------------------------------------------------
     If V_Itm_Unt Is Null Then
	 Select Itm_Unt Into V_Itm_Unt
	  From Ias_Itm_Dtl
	   Where Ias_Itm_Dtl.I_Code = P_I_Code
	     And Nvl(Ias_Itm_Dtl.Sale_Unit,0) = 1
	     And Nvl(Ias_Itm_Dtl.No_Sale,0)   = 0
	     And Rownum <= 1 ;
     End If;
     --------------------------------------------------------
     Return(V_Itm_Unt);
 Exception
   When Others Then
     Return (Null);

 End Get_Icode_Sales_Unit ;
--##----------------------------------------------------------------------------------------------##--
Function Get_Icode_Purch_Unit (P_I_Code In Ias_Itm_Mst.I_Code%Type ) Return Ias_Itm_Dtl.Itm_Unt%Type Is
  V_Itm_Unt Ias_Itm_Dtl.Itm_Unt%Type ;
 Begin

     Begin
	Select Itm_Unt Into V_Itm_Unt
      From Ias_Itm_Dtl
       Where Ias_Itm_Dtl.I_Code = P_I_Code ;
     Exception When Others Then
	V_Itm_Unt := Null;
     End;

     If V_Itm_Unt Is Null Then
	 Select Itm_Unt Into V_Itm_Unt
	  From Ias_Itm_Dtl
	   Where Ias_Itm_Dtl.I_Code = P_I_Code
	     And Nvl(Ias_Itm_Dtl.Pur_Unit,0) = 1
	     And Rownum <= 1 ;
     End If;

     Return(V_Itm_Unt);
 Exception
   When Others Then
     Return (Null);

 End Get_Icode_Purch_Unit ;
--##----------------------------------------------------------------------------------------------##--
Function Get_Icode_Size_Unit (P_I_Code	  In Ias_Itm_Mst.I_Code%Type ,P_Itm_Unt In Ias_Itm_Dtl.Itm_Unt%Type) Return Number Is
  V_Psize Number ;
 Begin
     Select P_Size Into V_Psize
      From Ias_Itm_Dtl
       Where I_Code	   = P_I_Code
	 And Itm_Unt=P_Itm_Unt
	 And RowNum		      <= 1 ;
     Return(V_Psize);
 Exception
   When Others Then
     Return (1);
 End Get_Icode_Size_Unit ;
--##----------------------------------------------------------------------------------------------##--
Procedure Get_Itm_QR_Code_Data (  P_QR_Code_Itm 	     In  Varchar2 ,
				  P_QR_Code_Prfx_Lngth	     In  Number    ,
				  P_QR_Code_Lngth	     In  Number   ,
				  P_QR_Code_Argmnt	     In  Number   ,
				  P_No_Of_Barcode_In_QR_Code In  Number   ,
				  P_Itm_Code		     Out Ias_Itm_Mst.I_Code%Type )  Is
  Begin
       If P_QR_Code_Itm Is Not Null Then
	  If  P_QR_Code_Argmnt = 1 Then -- Equal
	      If Length(P_QR_Code_Itm) = P_QR_Code_Lngth   Then
		 P_Itm_Code:= Substr(P_QR_Code_Itm,P_QR_Code_Prfx_Lngth +1,P_No_Of_Barcode_In_QR_Code );
	      End If ;
	  ElsIf  P_QR_Code_Argmnt = 2 Then -- Greater
	      If Length(P_QR_Code_Itm) > P_QR_Code_Lngth   Then
		 P_Itm_Code:= Substr(P_QR_Code_Itm,P_QR_Code_Prfx_Lngth +1,P_No_Of_Barcode_In_QR_Code );
	      End If ;
	  ElsIf  P_QR_Code_Argmnt = 3 Then -- Less
	      If Length(P_QR_Code_Itm) < P_QR_Code_Lngth   Then
		 P_Itm_Code:= Substr(P_QR_Code_Itm,P_QR_Code_Prfx_Lngth +1,P_No_Of_Barcode_In_QR_Code );
	      End If ;
	  ElsIf  P_QR_Code_Argmnt = 4 Then -- Greater Or Equal
	      If Length(P_QR_Code_Itm) >= P_QR_Code_Lngth   Then
		 P_Itm_Code:= Substr(P_QR_Code_Itm,P_QR_Code_Prfx_Lngth +1,P_No_Of_Barcode_In_QR_Code );
	      End If ;
	  ElsIf  P_QR_Code_Argmnt = 5 Then -- Less Or Equal
	      If Length(P_QR_Code_Itm) <= P_QR_Code_Lngth   Then
		 P_Itm_Code:= Substr(P_QR_Code_Itm,P_QR_Code_Prfx_Lngth +1,P_No_Of_Barcode_In_QR_Code );
	      End If ;
	  End If;
       End If ;
  End Get_Itm_QR_Code_Data ;	 	
--##----------------------------------------------------------------------------------------------##--
   Procedure Get_Itm_Wght_Data ( P_Itm_Barcode		 In  Ias_Itm_Dtl.Barcode%Type ,
				  P_Wght_Prfx		  In  Varchar2		       ,
				  P_Wght_Lngth		  In  Number		       ,
				  P_Wght_Itm_Lngth	  In  Number		       ,
				  P_Wght_Val		  In  Number		       ,
				  P_Wght_Val_Srvc	  In  Number		       ,
				  P_Remove_Wght_Dgt	  In  Number		       ,
				  P_Incld_Itm_Unt	  In  Number Default 0	       ,
				  P_Itm_Code		  Out Ias_Itm_Mst.I_Code%Type  ,
				  P_Itm_Qty		  Out Number		       ,
				  P_Itm_Unt		  Out Ias_Itm_Dtl.Itm_Unt%Type ,
				  P_Wght_Srvc_Itm_Price   Out Number)  Is
   V_Cnt Number:=0;
   V_Wght_Val_Itm Number;
   V_Service_Itm  Number:=0;
  Begin
       If  Upper(Substr(P_Itm_Barcode,1,Length(P_Wght_Prfx))) = Upper(P_Wght_Prfx)  And  Length(P_Itm_Barcode)= P_Wght_Lngth Then

	    P_Itm_Code:= Substr(P_Itm_Barcode,Length(P_Wght_Prfx) +1,P_Wght_Itm_Lngth );

	    Begin
	      Select Service_Itm,Wght_Val_Itm into V_Service_Itm,V_Wght_Val_Itm
	       From Ias_Itm_mst
	       where I_Code=P_Itm_Code
		And Nvl(Weighted,0)=1
		And Rownum<=1;
	    Exception When Others Then
	      V_Wght_Val_Itm:=Null;
	      V_Service_Itm:=0;
	    End;
	    If Nvl(V_Service_Itm,0)=1 And Nvl(V_Wght_Val_Itm,0)+nvl(P_Wght_Val_Srvc,0)>0 Then

		If P_Incld_Itm_Unt = 0 Then
		    -- Remove_Weight_Digit    1- From Right 2- From Left
		     If P_Remove_Wght_Dgt = 1  Then
			 P_Wght_Srvc_Itm_Price := Substr(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1)),1,Length(To_Number(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))))-1 )/Nvl(V_Wght_Val_Itm,Nvl(P_Wght_Val_Srvc,P_Wght_Val));
			 P_Itm_Qty:=1;
		     Elsif P_Remove_Wght_Dgt = 2  Then
			 P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2))/Nvl(V_Wght_Val_Itm,Nvl(P_Wght_Val_Srvc,P_Wght_Val));
			 P_Itm_Qty:=1;
		     Else
			 P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))/Nvl(V_Wght_Val_Itm,Nvl(P_Wght_Val_Srvc,P_Wght_Val)) ;
			 P_Itm_Qty:=1;
		     End If ;
		Else
		    --Get Item Unit
		     Begin
			  Select Itm_Unt Into P_Itm_Unt
			    From Ias_Itm_Dtl
			   Where I_Code =Substr(P_Itm_Barcode,Length(P_Wght_Prfx) +1,P_Wght_Itm_Lngth )
			     And Lvl_Unit=Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1,1);
		     Exception When Others Then
			  Select Itm_Unt Into P_Itm_Unt
			    From Ias_Itm_Dtl
			   Where I_Code =Substr(P_Itm_Barcode,Length(P_Wght_Prfx) +1,P_Wght_Itm_Lngth )
			     And Main_Unit=1;
		     End;
		    -- Remove_Weight_Digit    1- From Right 2- From Left
		     If P_Remove_Wght_Dgt = 1  Then
			 P_Wght_Srvc_Itm_Price := Substr(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2)),1,Length(To_Number(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))))-1 )/Nvl(V_Wght_Val_Itm,Nvl(P_Wght_Val_Srvc,P_Wght_Val))  ;
			 P_Itm_Qty:=1;
		     Elsif P_Remove_Wght_Dgt = 2  Then
			 P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+3))/Nvl(V_Wght_Val_Itm,Nvl(P_Wght_Val_Srvc,P_Wght_Val));
			 P_Itm_Qty:=1;
		     Else
			 P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2))/Nvl(V_Wght_Val_Itm,Nvl(P_Wght_Val_Srvc,P_Wght_Val)) ;
			 P_Itm_Qty:=1;
		     End If ;
		End If;
	    Else
		If P_Incld_Itm_Unt = 0 Then
		    -- Remove_Weight_Digit    1- From Right 2- From Left
		     If P_Remove_Wght_Dgt = 1  Then
			 P_Itm_Qty := Substr(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1)),1,Length(To_Number(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))))-1 )/Nvl(V_Wght_Val_Itm,P_Wght_Val)  ;
		     Elsif P_Remove_Wght_Dgt = 2  Then
			 P_Itm_Qty := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2))/Nvl(V_Wght_Val_Itm,P_Wght_Val);
		     Else
			 P_Itm_Qty := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))/Nvl(V_Wght_Val_Itm,P_Wght_Val) ;
		     End If ;
		Else
		    --Get Item Unit
		     Begin
			  Select Itm_Unt Into P_Itm_Unt
			    From Ias_Itm_Dtl
			   Where I_Code =Substr(P_Itm_Barcode,Length(P_Wght_Prfx) +1,P_Wght_Itm_Lngth )
			     And Lvl_Unit=Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1,1);
		     Exception When Others Then
			  Select Itm_Unt Into P_Itm_Unt
			    From Ias_Itm_Dtl
			   Where I_Code =Substr(P_Itm_Barcode,Length(P_Wght_Prfx) +1,P_Wght_Itm_Lngth )
			     And Main_Unit=1;
		     End;
		    -- Remove_Weight_Digit    1- From Right 2- From Left
		     If P_Remove_Wght_Dgt = 1  Then
			 P_Itm_Qty := Substr(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2)),1,Length(To_Number(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))))-1 )/Nvl(V_Wght_Val_Itm,P_Wght_Val)  ;
		     Elsif P_Remove_Wght_Dgt = 2  Then
			 P_Itm_Qty := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+3))/Nvl(V_Wght_Val_Itm,P_Wght_Val);
		     Else
			 P_Itm_Qty := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2))/Nvl(V_Wght_Val_Itm,P_Wght_Val) ;
		     End If ;
		End If;
	    End If;
       End If;
  End Get_Itm_Wght_Data ;
--##----------------------------------------------------------------------------------------------##--
  Procedure Get_Itm_Wght_Data ( P_Itm_Barcode		In  Ias_Itm_Dtl.Barcode%Type ,
				P_Wght_Prfx		In  Varchar2		     ,
				P_Wght_Lngth		In  Number		     ,
				P_Wght_Itm_Lngth	In  Number		     ,
				P_Wght_Val		In  Number		     ,
				P_Wght_Val_Srvc 	In  Number		     ,
				P_Remove_Wght_Dgt	In  Number		     ,
				P_Incld_Itm_Unt 	In  Number Default 0	     ,
				P_clc_qty_by_incld_price  In  Number		     ,
				P_wght_price_frc_lngth	In  Number		     ,
				P_Itm_Price		In  Number		     ,
				P_Itm_Code		Out Ias_Itm_Mst.I_Code%Type  ,
				P_Itm_Qty		Out Number		     ,
				P_Itm_Unt		Out Ias_Itm_Dtl.Itm_Unt%Type ,
				P_Wght_Srvc_Itm_Price	Out Number,
				P_USE_WGHT_INCLD_PRC	In  NUMBER   default null,
				P_WGHT_PRC_PRFX 	In  VARCHAR2 default null,
				P_WGHT_PRC_BRCDE_LNGTH	In  NUMBER   default null,
				P_RMOVE_WGHT_PRC_DGT	In  NUMBER   default null,
				P_CUR_FRC_NO		In  NUMBER   default 1
				)  Is
   V_Cnt Number:=0;
   V_Wght_Val_Itm Number;
   V_Service_Itm  Number:=0;
   V_NUM NUMBER(20):=1;
   V_Itm_Barcode Varchar2(100);
  Begin
      If  Upper(Substr(P_Itm_Barcode,1,Length(P_Wght_Prfx))) = Upper(P_Wght_Prfx)  And	Length(P_Itm_Barcode)= P_Wght_Lngth Then
	    P_Itm_Code:= Substr(P_Itm_Barcode,Length(P_Wght_Prfx) +1,P_Wght_Itm_Lngth );
	IF P_clc_qty_by_incld_price=1 THEN
		  If Nvl(P_WGHT_PRICE_FRC_LNGTH,0)>0 Then
		    For i in 1..P_WGHT_PRICE_FRC_LNGTH Loop
			V_NUM:=V_NUM||0;
		    End Loop;
		  End If;
	       If P_Incld_Itm_Unt = 0 Then
		    -- Remove_Weight_Digit    1- From Right 2- From Left
		     If P_Remove_Wght_Dgt = 1  Then
			   V_Itm_Barcode:=Substr(P_Itm_Barcode,1,P_Wght_Lngth-1);
			   P_Wght_Srvc_Itm_Price := Substr(To_Number(Substr(V_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1)),1,Length(To_Number(To_Number(Substr(V_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1)))) )/NVL(V_NUM,1);
			 --P_Wght_Srvc_Itm_Price := Substr(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1)),1,Length(To_Number(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))))-1 )/NVL(V_NUM,1);
		     Elsif P_Remove_Wght_Dgt = 2  Then
			 P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2))/NVL(V_NUM,1);
		     Else
			 P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))/NVL(V_NUM,1);
		     End If ;
		     If P_Itm_Price>0 THEN
			P_Itm_Qty:=P_Wght_Srvc_Itm_Price/P_Itm_Price;
		     End If;
	       Else
		    --Get Item Unit
		     Begin
			  Select Itm_Unt Into P_Itm_Unt
			    From Ias_Itm_Dtl
			   Where I_Code =Substr(P_Itm_Barcode,Length(P_Wght_Prfx) +1,P_Wght_Itm_Lngth )
			     And Lvl_Unit=Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1,1);
		     Exception When Others Then
			  Select Itm_Unt Into P_Itm_Unt
			    From Ias_Itm_Dtl
			   Where I_Code =Substr(P_Itm_Barcode,Length(P_Wght_Prfx) +1,P_Wght_Itm_Lngth )
			     And Main_Unit=1;
		     End;
		    -- Remove_Weight_Digit    1- From Right 2- From Left
		     If P_Remove_Wght_Dgt = 1  Then
			 V_Itm_Barcode:=Substr(P_Itm_Barcode,1,P_Wght_Lngth-1);
			 P_Wght_Srvc_Itm_Price := Substr(To_Number(Substr(V_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2)),1,Length(To_Number(To_Number(Substr(V_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))))-1 )/NVL(V_NUM,1);
		     Elsif P_Remove_Wght_Dgt = 2  Then
			 P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+3))/NVL(V_NUM,1);
		     Else
			 P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2))/NVL(V_NUM,1);
		     End If ;
		     If P_Itm_Price>0 THEN
			P_Itm_Qty:=P_Wght_Srvc_Itm_Price/P_Itm_Price;
		     End If;
	       End If ;
	ELSE
	    Begin
	      Select Service_Itm,Wght_Val_Itm into V_Service_Itm,V_Wght_Val_Itm
	       From Ias_Itm_mst
	       where I_Code=P_Itm_Code
		And Nvl(Weighted,0)=1
		And Rownum<=1;
	    Exception When Others Then
	      V_Wght_Val_Itm:=Null;
	      V_Service_Itm:=0;
	    End;
	    If Nvl(V_Service_Itm,0)=1  And Nvl(V_Wght_Val_Itm,0)+nvl(P_Wght_Val_Srvc,0)>0 Then

		If P_Incld_Itm_Unt = 0 Then
		    -- Remove_Weight_Digit    1- From Right 2- From Left
		     If P_Remove_Wght_Dgt = 1  Then
			 P_Wght_Srvc_Itm_Price := Substr(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1)),1,Length(To_Number(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))))-1 )/Nvl(V_Wght_Val_Itm,Nvl(P_Wght_Val_Srvc,P_Wght_Val));
			 P_Itm_Qty:=1;
		     Elsif P_Remove_Wght_Dgt = 2  Then
			 P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2))/Nvl(V_Wght_Val_Itm,Nvl(P_Wght_Val_Srvc,P_Wght_Val));
			 P_Itm_Qty:=1;
		     Else
			 P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))/Nvl(V_Wght_Val_Itm,Nvl(P_Wght_Val_Srvc,P_Wght_Val)) ;
			 P_Itm_Qty:=1;
		     End If ;
		Else
		    --Get Item Unit
		     Begin
			  Select Itm_Unt Into P_Itm_Unt
			    From Ias_Itm_Dtl
			   Where I_Code =Substr(P_Itm_Barcode,Length(P_Wght_Prfx) +1,P_Wght_Itm_Lngth )
			     And Lvl_Unit=Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1,1);
		     Exception When Others Then
			  Select Itm_Unt Into P_Itm_Unt
			    From Ias_Itm_Dtl
			   Where I_Code =Substr(P_Itm_Barcode,Length(P_Wght_Prfx) +1,P_Wght_Itm_Lngth )
			     And Main_Unit=1;
		     End;
		    -- Remove_Weight_Digit    1- From Right 2- From Left
		     If P_Remove_Wght_Dgt = 1  Then
			 P_Wght_Srvc_Itm_Price := Substr(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2)),1,Length(To_Number(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))))-1 )/Nvl(V_Wght_Val_Itm,Nvl(P_Wght_Val_Srvc,P_Wght_Val))  ;
			 P_Itm_Qty:=1;
		     Elsif P_Remove_Wght_Dgt = 2  Then
			 P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+3))/Nvl(V_Wght_Val_Itm,Nvl(P_Wght_Val_Srvc,P_Wght_Val));
			 P_Itm_Qty:=1;
		     Else
			 P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2))/Nvl(V_Wght_Val_Itm,Nvl(P_Wght_Val_Srvc,P_Wght_Val)) ;
			 P_Itm_Qty:=1;
		     End If ;
		End If;
	    Else
		If P_Incld_Itm_Unt = 0 Then
		    -- Remove_Weight_Digit    1- From Right 2- From Left
		     If P_Remove_Wght_Dgt = 1  Then
			 P_Itm_Qty := Substr(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1)),1,Length(To_Number(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))))-1 )/Nvl(V_Wght_Val_Itm,P_Wght_Val)  ;
		     Elsif P_Remove_Wght_Dgt = 2  Then
			 P_Itm_Qty := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2))/Nvl(V_Wght_Val_Itm,P_Wght_Val);
		     Else
			 P_Itm_Qty := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))/Nvl(V_Wght_Val_Itm,P_Wght_Val) ;
		     End If ;
		Else
		    --Get Item Unit
		     Begin
			  Select Itm_Unt Into P_Itm_Unt
			    From Ias_Itm_Dtl
			   Where I_Code =Substr(P_Itm_Barcode,Length(P_Wght_Prfx) +1,P_Wght_Itm_Lngth )
			     And Lvl_Unit=Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1,1);
		     Exception When Others Then
			  Select Itm_Unt Into P_Itm_Unt
			    From Ias_Itm_Dtl
			   Where I_Code =Substr(P_Itm_Barcode,Length(P_Wght_Prfx) +1,P_Wght_Itm_Lngth )
			     And Main_Unit=1;
		     End;
		    -- Remove_Weight_Digit    1- From Right 2- From Left
		     If P_Remove_Wght_Dgt = 1  Then
			 P_Itm_Qty := Substr(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2)),1,Length(To_Number(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))))-1 )/Nvl(V_Wght_Val_Itm,P_Wght_Val)  ;
		     Elsif P_Remove_Wght_Dgt = 2  Then
			 P_Itm_Qty := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+3))/Nvl(V_Wght_Val_Itm,P_Wght_Val);
		     Else
			 P_Itm_Qty := To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+2))/Nvl(V_Wght_Val_Itm,P_Wght_Val) ;
		     End If ;
		End If;
	    End If;

	End If;
      Else   --USE_WGHT_INCLD_PRC
	    If NVL(P_USE_WGHT_INCLD_PRC,0)=1 And Upper(Substr(P_Itm_Barcode,1,Length(P_WGHT_PRC_PRFX))) = Upper(P_WGHT_PRC_PRFX)  And  Length(P_Itm_Barcode)= P_WGHT_PRC_BRCDE_LNGTH Then
		    For i in 1..P_CUR_FRC_NO Loop
			V_NUM:=V_NUM||0;
		    End Loop;

		 P_Itm_Code:= Substr(P_Itm_Barcode,Length(P_wght_prc_prfx) +1,P_Wght_Itm_Lngth );
		 Begin
		  Select Wght_Val_Itm into V_Wght_Val_Itm
		   From Ias_Itm_mst
		   where I_Code=P_Itm_Code
		    And Rownum<=1;
		Exception When Others Then
		  V_Wght_Val_Itm:=Null;
		End;

		 If P_RMOVE_WGHT_PRC_DGT = 1  Then
		     P_Itm_Qty := Substr(To_Number(Substr(P_Itm_Barcode,Length(P_WGHT_PRC_PRFX)+P_Wght_Itm_Lngth+1,5)),1,Length(To_Number(To_Number(Substr(P_Itm_Barcode,Length(P_Wght_Prfx)+P_Wght_Itm_Lngth+1))))-1 )/P_Wght_Val  ;
		     P_Wght_Srvc_Itm_Price := Substr(To_Number(Substr(P_Itm_Barcode,P_WGHT_PRC_BRCDE_LNGTH-5)),1,Length(To_Number(To_Number(Substr(P_Itm_Barcode,P_WGHT_PRC_BRCDE_LNGTH-5))))-1 )/NVL(V_NUM,1);
		 Elsif P_RMOVE_WGHT_PRC_DGT = 2  Then
		     P_Itm_Qty := To_Number(Substr(P_Itm_Barcode,Length(P_WGHT_PRC_PRFX)+P_Wght_Itm_Lngth+2,5))/P_Wght_Val;
		     P_Wght_Srvc_Itm_Price :=To_Number(Substr(P_Itm_Barcode,P_WGHT_PRC_BRCDE_LNGTH-5))/NVL(V_NUM,1);
		 Else
		     P_Itm_Qty := To_Number(Substr(P_Itm_Barcode,Length(P_WGHT_PRC_PRFX)+P_Wght_Itm_Lngth+1,5))/P_Wght_Val ;
		     P_Wght_Srvc_Itm_Price := To_Number(Substr(P_Itm_Barcode,P_WGHT_PRC_BRCDE_LNGTH-5))/NVL(V_NUM,1)
		      ;
		 End If ;
	    End If;
      End If;
  End Get_Itm_Wght_Data ;
--##----------------------------------------------------------------------------------------------##--
  Function Get_Max_Lvl_Unt (P_I_Code	In Ias_Itm_Mst.I_Code%Type) Return Ias_Itm_Dtl.Lvl_Unit%Type Is
	  V_Lvl_Unit Ias_Itm_Dtl.Lvl_Unit%Type ;
	Begin
	     Select Max(Lvl_Unit) Into V_Lvl_Unit
	      From Ias_Itm_Dtl
	       Where I_Code= P_I_Code;
	     Return(V_Lvl_Unit);
	 Exception
	   When Others Then
	     Return (1);
  End Get_Max_Lvl_Unt ;
--##----------------------------------------------------------------------------------------------##--
 Function Get_Icode_By_GTIN_Code (P_GTIN_Code	In Ias_Itm_Mst.GTIN_Code%Type ) Return Varchar2 Is
    V_I_Code Ias_Itm_Mst.I_Code%Type ;
  Begin
     Begin
	Select I_Code
	    Into V_I_Code
	From Inv_Fda_Itm
	Where GTIN_Code = P_GTIN_Code
	   And Rownum <=1;
    Exception When Others Then
	Select I_Code
	 Into V_I_Code
	From Ias_Itm_Mst
	 Where GTIN_Code = P_GTIN_Code ;
    End;
    Return(V_I_Code) ;
  Exception
   When Others Then
    Return(V_I_Code);
  End Get_Icode_By_GTIN_Code;
--##----------------------------------------------------------------------------------------------##--
Function Get_GTIN_Code (P_I_Code   In Ias_Itm_Mst.I_Code%Type ) Return Varchar2 Is
   V_GTIN_Code Ias_Itm_Mst.GTIN_Code%Type ;
 Begin
    Select GTIN_Code
     Into V_GTIN_Code
    From Ias_Itm_Mst
     Where I_Code = P_I_Code ;
    Return(V_GTIN_Code) ;
 Exception
  When Others Then
   Return(P_I_Code);
 End Get_GTIN_Code;
--##----------------------------------------------------------------------------------------------##--
Function Get_Itm_Price_Docacy ( P_Icode 		       In Ias_Itm_Mst.I_Code%Type,
				P_Itm_Unt		       In Ias_Itm_Dtl.Itm_Unt%Type,
				P_Acy			       In Varchar2,
				P_Loc_Cur		       In Varchar2,
				P_Stk_Cur		       In Varchar2,
				P_Ac_Rate		       In Number,
				P_Stk_Rate		       In Number,
				P_Lev_No			 In Number,
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
				P_Itm_Use_Price_BtchNo_Optnl   In Number    Default 0,
				P_Usr_No		       In User_R.U_Id%Type    ) RETURN NUMBER Is
  V_Price    Number;
  V_Cur_Rate Number;
  V_Whr      Varchar2(10000):='';
  V_Whr1     Varchar2(10000):='';
Begin
    ---------------------------------------------------------------------------
    If P_Price_Type IN (2,4) Then
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
    Begin
	Execute Immediate 'Select B.Cur_Rate
			     From Ias_Pricing_Levels A,Gls_Crncy_Usr_Lmt B
			    Where A.A_Cy     = B.Cur_Code
			      And A.Lev_No   = '||P_Lev_No||'
			      And B.User_No  = '||P_Usr_No||'
			      And Rownum<=1' Into V_Cur_Rate;
    Exception
      When Others Then
       V_Cur_Rate:= Null;
    End;
    ---------------------------------------------------------------------------
    Begin
	Execute Immediate 'Select Decode(a.A_Cy, '''||P_Acy||''', b.I_Price,
							   '''||P_Stk_Cur||''' , ((b.I_Price*'||P_Stk_Rate||')/'||P_Ac_Rate||'),
							   '''||P_Loc_Cur||''' , (b.I_Price/'||P_Ac_Rate||'),
							   ((b.I_Price * Decode('||NVL(V_Cur_Rate,0)||',0,C.Cur_Rate,'||NVL(V_Cur_Rate,0)||') ) / '||P_Ac_Rate||'))
					 From Ias_Pricing_Levels a,Ias_Item_Price b,Ex_Rate c
					Where a.Lev_No	 = b.Lev_No
					  And b.Lev_No	 = '||P_Lev_No||'
					  And b.I_Code	 = '''||P_Icode||'''
					  And b.Itm_Unt  = '''||P_Itm_Unt||'''
					  And c.Cur_Code = a.A_Cy
					  And Nvl(a.Bill_Doc_Type,0)= Decode(a.Bill_Doc_Type,Null,0,Decode('||Nvl(P_Bill_Doc_Type,1)||',4,2,1))
					  '||V_Whr||V_Whr1||'
					  And Rownum<=1' Into V_Price;
    Exception
      When No_Data_Found Then
	Null;
    When Others Then
       Raise_Application_Error(-20401,'Error Get Item Price ' || '' || SqlErrm);
    End;
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
							   ((b.I_Price * Decode('||NVL(V_Cur_Rate,0)||',0,C.Cur_Rate,'||NVL(V_Cur_Rate,0)||') ) / '||P_Ac_Rate||'))
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


  Return(V_Price);

 Exception
   When others Then
    Return(Null);
End Get_Itm_Price_Docacy;
--##----------------------------------------------------------------------------------------------##--
Function Get_Icode_Unt (P_I_Code    In Ias_Itm_Mst.I_Code%Type	,P_Unt_Type  In  Number,P_Lvl_Unt In Number Default Null) Return Varchar2  Is
  V_Itm_Unt    Ias_Itm_Dtl.Itm_Unt%Type;
Begin
	   If P_Unt_Type=1  Then     --  Get Main Unit
	     Select Itm_Unt  Into  V_Itm_Unt
		  From Ias_Itm_Dtl
		   Where I_Code= P_I_Code
		     And Main_Unit = 1;
	   Elsif  P_Unt_Type=2	Then	 --  Get Sale Unit
	     Select Itm_Unt  Into  V_Itm_Unt
		  From Ias_Itm_Dtl
		   Where I_Code= P_I_Code
		     And Sale_Unit=1;
	   Elsif  P_Unt_Type=3	Then	 --  Get Purchase Unit
	     Select Itm_Unt  Into  V_Itm_Unt
		  From Ias_Itm_Dtl
		   Where I_Code= P_I_Code
		     And Pur_Unit=1;
	   Elsif  P_Unt_Type=4	Then  --  Get Max  Unit
	   Select Itm_Unt  Into  V_Itm_Unt
		  From Ias_Itm_Dtl
		  Where I_Code= P_I_Code
		  And Lvl_Unit = ( Select Max(Lvl_Unit)
				    From Ias_Itm_Dtl
				    Where I_Code= P_I_Code);
	   Elsif  P_Unt_Type=5	Then  --  Get Specific Unit
	    Select Itm_Unt  Into  V_Itm_Unt
		  From Ias_Itm_Dtl
		  Where I_Code= P_I_Code
		  And Lvl_Unit =Nvl(P_Lvl_Unt,1);
	   End If;
  Return(V_Itm_Unt);
 Exception
   When Others Then
    Begin
      Select Itm_Unt  Into  V_Itm_Unt
      From Ias_Itm_Dtl
      Where I_Code= P_I_Code
      And Main_Unit = 1;
      Return(V_Itm_Unt);
    Exception
     When Others Then
       Return ' ';
    End;
 End Get_Icode_Unt ;
--##----------------------------------------------------------------------------------------------##--
 Function Get_Itm_Unt_Lvl ( P_I_Code	In  Ias_Itm_Mst.I_Code%Type    ,
			    P_Lvl_Unit	In  Ias_Itm_Dtl.Lvl_Unit%Type  ) Return Varchar2 Is
   V_Itm_Unt	Ias_Itm_Dtl.Itm_Unt%Type;
 Begin
    Select Itm_Unt
     Into  V_Itm_Unt
    From   Ias_Itm_Dtl
     Where I_Code     = P_I_Code
       And Lvl_Unit   = P_Lvl_Unit
       And RowNum <= 1 ;
    Return (V_Itm_Unt) ;
 Exception
  When Others Then
     Return (' ') ;
 End Get_Itm_Unt_Lvl ;
--##----------------------------------------------------------------------------------------------##--
 Function Get_Icode_Trns_Unit (P_I_Code In Ias_Itm_Mst.I_Code%Type ) Return Ias_Itm_Dtl.Itm_Unt%Type Is
  V_Itm_Unt Ias_Itm_Dtl.Itm_Unt%Type ;
 Begin
     Begin
	Select Itm_Unt Into V_Itm_Unt
      From Ias_Itm_Dtl
       Where Ias_Itm_Dtl.I_Code = P_I_Code ;
     Exception When Others Then
	V_Itm_Unt := Null;
     End;

     If V_Itm_Unt Is Null Then
	 Select Itm_Unt Into V_Itm_Unt
	  From Ias_Itm_Dtl
	   Where Ias_Itm_Dtl.I_Code = P_I_Code
	     And Nvl(Ias_Itm_Dtl.Trns_Unit,0) = 1
	     And Rownum <= 1 ;
     End If;
     Return(V_Itm_Unt);
 Exception
   When Others Then
     Return (Null);
 End Get_Icode_Trns_Unit ;
--##----------------------------------------------------------------------------------------------##--
End  IAS_ITM_PKG;
/
