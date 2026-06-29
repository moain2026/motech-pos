-- =============================================
-- PACKAGE SPEC: IAS_FETCH_DATA_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
Package IAS_Fetch_Data_Pkg Is
			Type t_cv Is Ref Cursor;
								Procedure Get_Itm_Dtl( a_cv	   In Out t_cv ,
										       P_Sql	   In Varchar2 ,
										       P_Sql_Type  In Number   ,
										       P_Lang_no   In Number   ,
										       P_OrdBy	   In Varchar2 ,
										       P_User_No   In Number   );	
		 Procedure Get_Itm_Dtl_Serch(A_Cv		  In Out   T_Cv,
			   P_Icode		 In Ias_Itm_Mst.I_Code%Type,
			   P_Iname		 In Ias_Itm_Mst.I_Name%Type,
			   P_Wcode		 In Number,
			   P_Acy		 In Varchar2,
			   P_Loc_Cur		 In Varchar2,
			   P_Ac_Rate		 In Number,
			   P_Lev_No		 In Number,
			   P_Brn_No		 In Number  Default Null,
			   P_Price_Type 	 In Number,
			   P_No_Of_Dcml 	 In Number,
			   P_User_No		 In Number,
			   P_Lang_No		 In Number,
			   P_Itm_Unt_Typ	 In Number,
			   P_Itm_Unt_Lvl	 In Number,
			   P_Ordr_Clmn		 In Varchar2,
			   P_Use_Price_Exp_Date  In Number  Default 0,
			   P_Use_Price_Batch_No  In Number  Default 0,
			   P_Whr		 In Varchar2  Default Null,
			   P_Sql_Type		 In Number   Default 1,
			   P_Wtavg_Type 	 In Number   Default 1,
			   P_Shw_Cst		 In Number   Default 0,
			   P_Stk_Rate		 In Number   Default 1)  ;		
PROCEDURE FTCH_DATA_LST_SCR ( SQL_CV	   IN OUT T_CV,
			      P_LST_SQL    IN VARCHAR2,
			      P_LST_SRCH   IN VARCHAR2,
			      P_LST_ORDR   IN VARCHAR2,
			      P_LANG_NO    IN NUMBER  DEFAULT 1,
			      P_USER_NO    IN USER_R.U_ID%TYPE,
			      P_WHR	   IN VARCHAR2,
			      P_WHR_FLD   IN VARCHAR2); 			  						
		 End IAS_Fetch_Data_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_FETCH_DATA_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
Package Body IAS_Fetch_Data_Pkg is
--=============================================================
Procedure Get_Itm_Dtl( a_cv	   In Out t_cv,
			 P_Sql	     In Varchar2,
			 P_Sql_Type  In Number,
			 P_Lang_no   In Number	   ,
			 P_OrdBy     In Varchar2,
			 P_User_No   In Number) IS
    Begin
	If P_Sql_Type = 1 Then
	  Open a_cv for
	    'Select A.I_Code I_Code,
		    Decode(:P_Lang_no,1,Nvl(A.I_Name,A.I_E_name),Nvl(A.I_E_Name,A.I_Name)) I_Name,
		    C.Itm_Unt Unit,
		    Null  W_Code,
		    Null  Expire_Date,
		    Null  Batch_No,
		    Null  Avl_Qty,
		    C.I_Price,
		    Decode(:P_Lang_no,1,Nvl(d.It_A_Name,d.It_E_name),Nvl(d.It_E_Name,d.It_A_Name)) Item_Type,
		    A.I_Desc,
		    A.Alter_Code
	       From Ias_Itm_Mst a ,Ias_Item_Price c ,Item_Types d
	      Where A.Item_Type=d.Type_Of_Item(+)'|| P_Sql || P_OrdBy
		 Using P_Lang_no
		      ,P_Lang_no ;
 ElsIf P_Sql_Type = 2 Then
	  Open a_cv for
	    'Select A.I_Code I_Code,
		    Decode(:P_Lang_no,1,Nvl(A.I_Name,A.I_E_name),Nvl(A.I_E_Name,A.I_Name)) I_Name,
		    b.Itm_Unt,
		    b.W_Code,
		    Null Expire_Date,
		    Null Batch_No,
		    Sum( ((b.Pf_Qty + b.P_Qty)/b.P_Size) * b.In_Out) Avl_Qty,
		    c.I_Price,
		    Decode(:P_Lang_no,1,Nvl(d.It_A_Name,d.It_E_name),Nvl(d.It_E_Name,d.It_A_Name)) Item_Type,
		    a.I_Desc,
		    a.Alter_Code
		From Ias_Itm_Mst a,Item_Movement b,Ias_Item_Price c ,Item_Types d
	       Where A.I_Code = B.I_Code
		 And A.Item_Type=d.Type_Of_Item(+)
		 And Exists (Select 1 From Privilege_Wh
			      Where W_Code	     = B.W_Code
				And U_Id= :P_User_No
				And NVl(View_Flag,0) = 1
				And RowNum	     <= 1 ) '|| P_Sql  ||'
		   Group By A.I_Code,
			    Decode(:P_Lang_no,1,Nvl(A.I_Name,A.I_E_name),Nvl(A.I_E_Name,A.I_Name)),
			    b.Itm_Unt,
			    b.W_Code,
			    c.I_Price,
			    Decode(:P_Lang_no,1,Nvl(d.It_A_Name,d.It_E_name),Nvl(d.It_E_Name,d.It_A_Name)),
			    a.I_Desc,
			    a.Alter_Code' || P_OrdBy
		       Using P_Lang_no
				,P_Lang_no
				,P_User_No
				,P_Lang_no
				,P_Lang_no ;
ElsIf P_Sql_Type = 3 Then
	  Open a_cv for
	    'Select A.I_Code I_Code,
		    Decode(:P_Lang_no,1,Nvl(a.I_Name,a.I_E_name),Nvl(a.I_E_Name,a.I_Name)) I_Name,
		    m.Itm_Unt,
		    b.W_Code,
		    Decode(b.Expire_date,''01/01/1900'',Null,b.Expire_Date) Expire_Date,
		    Decode(b.Batch_No,''0'',Null,b.Batch_No) Batch_No,
		    Sum( ((b.Pf_Qty + b.P_Qty)/b.P_Size) * b.In_Out) Avl_Qty,
		    c.I_Price,
		    Decode(:P_Lang_no,1,Nvl(d.It_A_Name,d.It_e_name),Nvl(d.It_e_Name,d.It_A_Name)) Item_Type,
		    a.I_Desc,
		    a.Alter_Code
	       From Ias_Itm_Mst a,Item_Movement b,Ias_Item_Price c ,Item_Types d,Ias_Itm_dtl m
	      Where A.I_Code = B.I_Code(+)
		And A.I_Code = M.I_Code
		And A.I_Code = C.I_Code(+)
		And A.Item_Type=d.Type_Of_Item(+)
		And (Exists (Select 1 From Privilege_Wh
			     Where W_Code	    = B.W_Code
			       And  U_Id= :P_User_No
			       And  NVl(View_Flag,0) = 1
			       And RowNum	    <= 1 ) OR B.W_CODE IS NULL ) '|| P_Sql||'
	      Group By	  A.I_Code,
			Decode(:P_Lang_no,1,Nvl(a.I_Name,a.I_E_name),Nvl(a.I_E_Name,a.I_Name)),
			m.Itm_Unt,
			b.W_Code,
			Decode(b.Expire_date,''01/01/1900'',Null,b.Expire_Date),
			Decode(b.Batch_No,''0'',Null,b.Batch_No),
			c.I_Price,
			Decode(:P_Lang_no,1,Nvl(d.It_A_Name,d.It_e_name),Nvl(d.It_e_Name,d.It_A_Name)),
			a.I_Desc,
			a.Alter_Code' ||P_OrdBy
			      Using P_Lang_no
				       ,P_Lang_no
				       ,P_User_No
				       ,P_Lang_no
				       ,P_Lang_no;


ElsIf P_Sql_Type =4 Then
	  Open a_cv for
	    'Select A.I_Code I_Code,
		    Decode(:P_Lang_no,1,Nvl(a.I_Name,a.I_E_name),Nvl(a.I_E_Name,a.I_Name)) I_Name,
		    b.Itm_Unt Unit,
		    b.W_Code,
		    Null Expire_Date,
		    Null Batch_No,
		    Null Item_Type,
		    Null I_Price,
		    nvl(b.AVL_QTY,0)  AVL_QTY,
		    a.I_Desc,
		    a.Alter_Code
	       From Ias_Itm_Mst a,Ias_Itm_Wcode b
	      Where A.I_Code = B.I_Code(+)
		And (b.W_Code is null or Exists (Select 1 From Privilege_Wh
			     Where W_Code	    = B.W_Code
			       And U_Id= :P_User_No
			       And NVl(View_Flag,0) = 1
			       And RowNum	    <= 1 )) '|| P_Sql || P_OrdBy
		       Using P_Lang_no
			     ,P_User_No;
  ElsIf P_Sql_Type = 5 Then
	  Open A_Cv For
	    'Select A.I_Code I_Code,
		    Decode(:P_Lang_no,1,Nvl(a.I_Name,a.I_E_name),Nvl(a.I_E_Name,a.I_Name)) I_Name,
		    b.Itm_Unt,
		    Null W_Code,
		    NULL Expire_Date,
		    Decode(c.Batch_No,''0'',Null,c.Batch_No) Batch_No,
		    null Avl_Qty,
		    NULL I_Price,
		    Null Item_Type,
		    a.I_Desc,
		    a.Alter_Code
	       From Ias_Itm_Mst A,Ias_Itm_Dtl  B,Ias_Itm_Batch C
	      Where A.I_Code = C.I_Code(+)
		And A.I_Code=B.I_Code
		'|| P_Sql||'
	      Group By	  A.I_Code,
			Decode(:P_Lang_no,1,Nvl(a.I_Name,a.I_E_name),Nvl(a.I_E_Name,a.I_Name)),
			b.Itm_Unt,
			a.I_Desc,
			Decode(c.Batch_No,''0'',Null,c.Batch_No),
			a.Alter_Code' ||P_OrdBy
			      Using P_Lang_no
				    ,P_Lang_no;
ElsIf P_Sql_Type = 6 Then
	  Open A_cv For
	'Select A.I_code I_code,
		Decode(:P_lang_no,1,Nvl(A.I_name,A.I_e_name),Nvl(A.I_e_name,A.I_name)) I_name,
		F.Itm_unt Unit,
		Null  W_code,
		Null  Expire_date,
		Null  Batch_no,
		Null  Avl_qty,
		Case
		 When  Nvl(C.P_size,1) = Nvl(F.P_size,1)
		  Then (C.Vndr_price)
		 When	Nvl(C.P_size,1) > Nvl(F.P_size,1)
		  Then (C.Vndr_p+rice /Nvl(F.P_size,1) )
		 When	Nvl(C.P_size,1) < Nvl(F.P_size,1)
		  Then ( C.Vndr_price * Nvl(F.P_size,1))
		End I_price,
		 Null Item_type,
		A.I_desc,
		A.Alter_code
	   From Ias_itm_mst A ,Ias_itm_dtl F,Ias_v_vndr_itm C
	  Where A.I_code = F.I_code
	  And A.I_code = C.I_code '|| P_sql || P_ordby
			      Using P_lang_no	  ;
  End If;
Exception When others then
    Raise_application_error(-20417,'Error When Query From Item_Dtl Table '||SqlErrm) ;
End Get_Itm_Dtl;
--=======================================================================================
Procedure Get_Itm_Dtl_Serch(A_Cv		In Out	 T_Cv,
			   P_Icode		 In Ias_Itm_Mst.I_Code%Type,
			   P_Iname		 In Ias_Itm_Mst.I_Name%Type,
			   P_Wcode		 In Number,
			   P_Acy		 In Varchar2,
			   P_Loc_Cur		 In Varchar2,
			   P_Ac_Rate		 In Number,
			   P_Lev_No		 In Number,
			   P_Brn_No		 In Number  Default Null,
			   P_Price_Type 	 In Number,
			   P_No_Of_Dcml 	 In Number,
			   P_User_No		 In Number,
			   P_Lang_No		 In Number,
			   P_Itm_Unt_Typ	 In Number,
			   P_Itm_Unt_Lvl	 In Number,
			   P_Ordr_Clmn		 In Varchar2,
			   P_Use_Price_Exp_Date  In Number  Default 0,
			   P_Use_Price_Batch_No  In Number  Default 0,
			   P_Whr		 In Varchar2  Default Null,
			   P_Sql_Type		 In Number   Default 1,
			   P_Wtavg_Type 	 In Number   Default 1,
			   P_Shw_Cst		 In Number   Default 0,
			   P_Stk_Rate		 In Number   Default 1
) Is
   V_Whr    Varchar2 (3000);
Begin

   If P_Itm_Unt_Typ Is Not Null Then
	If  P_Itm_Unt_Typ=1 Then
	  V_Whr := V_Whr|| ' And Nvl(D.Main_Unit,0)= 1 ';
	ElsIf  P_Itm_Unt_Typ=2 Then
	  V_Whr := V_Whr|| ' And Nvl(D.SALE_UNIT,0)= 1 ';
	ElsIf  P_Itm_Unt_Typ=3 Then
	  V_Whr := V_Whr|| ' And Nvl(D.PUR_UNIT,0)= 1 ';
	ElsIf  P_Itm_Unt_Typ=4 Then
	  V_Whr := V_Whr|| ' And Nvl(D.Lvl_Unit,0)= Ias_Itm_Pkg.Get_Max_Lvl_Unt (P_I_Code=>D.I_Code)';
	ElsIf  P_Itm_Unt_Typ=5 Then
	  V_Whr := V_Whr|| ' And Nvl(D.Lvl_Unit,0)= '''||Nvl(P_Itm_Unt_Lvl,1)||'''';
	End If;
   End If;

    IF P_Whr IS NOT NULL THEN
     V_Whr := V_Whr || P_Whr;
   End If;

   --##PRMTR FOR PRICE
   -------------------------------------------------------------------------------------------------
     If P_Price_Type=2 Then
      V_Whr := V_Whr||' And b.W_Code='||P_Wcode;
    End If;
    ---------------------------------------------------------------------------
    If P_Price_Type=5 Then
       V_Whr := V_Whr||' And b.Brn_No='||P_Brn_No;
    End If;
   -------------------------------------------------------------------------------------------------
   IF P_Ordr_Clmn IS NOT NULL THEN
     V_Whr := V_Whr||' ORDER BY '||P_Ordr_Clmn;
   End If;
   -------------------------------------------------------------------------------------------------
 If P_Sql_Type=1 Then
 Open A_Cv For	  'Select DISTINCT m.i_code,
			  Decode(:P_Lang_No,1,nvl(m.i_name,m.i_e_name),nvl(m.i_e_name,m.i_name)) i_name,
			  d.Itm_Unt,
			  Null w_code,
			  Decode(b.Expire_date,''01/01/1900'',Null,b.Expire_Date) Expire_Date,
			  Decode(b.Batch_No,''0'',Null,b.Batch_No) Batch_No,
			  0 Avl_Qty,
			  Round(Decode(:P_Acy,:P_Loc_Cur,i_price,i_price/Nvl(:P_Ac_Rate,1)),:P_No_Of_Dcml) i_price,
			  m.i_desc,
			  Nvl(M.Use_exp_date,0) Use_exp_date,
			  Nvl(M.Use_batch_no,0) Use_batch_no,
		       Decode(:P_Shw_Cst,0,0,
			  Round( (Ias_Itm_Pkg.Get_Grand_Wtavg (P_Wtavg_Type => :P_Wtavg_Type	,
						       P_Icode	    => m.i_code ,
						       P_Wcode	    => :P_Wcode)*Nvl(D.P_Size,1)*Nvl(:P_Stk_Rate,1))/Nvl(:P_Ac_Rate,1),5)) STK_CST
		    From Ias_Itm_Mst M,Ias_Itm_Dtl D,Ias_Item_Price b
		   where M.i_code=D.i_code
		    and m.i_code=b.i_code
		    and d.i_code=b.i_code
		    and d.itm_unt=b.itm_unt
		    And B.Lev_no=:P_lev_no
		    and b.i_price>0
		    and nvl(d.no_sale,0) = 0
		    and nvl(m.inactive,0)= 0
		    and nvl(m.Use_serialno,0) = 0
		    and upper(m.I_Code) Like ''%''||upper(Nvl(:P_Icode,m.I_Code))||''%''
		    and upper(m.I_Name) Like ''%''||upper(Nvl(:P_Iname,m.I_Name))||''%''
		    and  exists (select 1 From privilege_gc
				 where u_id = :p_user_no
				   and g_code = m.g_code
				   and nvl(add_flag,0) = 1
				   and rownum <= 1) '
				   || V_Whr
   Using P_Lang_No,
	 P_Acy,
	 P_Loc_Cur,
	 P_Ac_Rate,
	 P_No_Of_Dcml,
	 P_Shw_Cst,
	 P_Wtavg_Type,
	 P_Stk_Rate,
	 P_Ac_Rate,
	 P_Wcode,
	 P_lev_no,
	 P_Icode,
	 P_Iname,
	 p_user_no;
 Else
   Open A_Cv For    'Select DISTINCT m.i_code,
			 Decode(:P_Lang_No,1,nvl(m.i_name,m.i_e_name),nvl(m.i_e_name,m.i_name)) i_name,
			 d.Itm_Unt,
			 a.w_code,
			 Decode(a.Expire_date,''01/01/1900'',Null,a.Expire_Date) Expire_Date,
			 Decode(a.Batch_No,''0'',Null,a.Batch_No) Batch_No,
			 Round(nvl(avl_qty,0)/d.P_Size,:P_No_Of_Dcml) Avl_Qty,
			 Round(Decode(:P_Acy,:P_Loc_Cur,b.i_price,b.i_price/Nvl(:P_Ac_Rate,1)),:P_No_Of_Dcml) i_price,
			 m.i_desc,
			 Nvl(M.Use_exp_date,0) Use_exp_date,
			 Nvl(M.Use_batch_no,0) Use_batch_no,
		      Decode(:P_Shw_Cst,0,0,
			Round( (Ias_Itm_Pkg.Get_Grand_Wtavg (P_Wtavg_Type => :P_Wtavg_Type    ,
						       P_Icode	    => m.i_code ,
						       P_Wcode	    => :P_Wcode)*Nvl(D.P_Size,1)*Nvl(:P_Stk_Rate,1))/Nvl(:P_Ac_Rate,1),5)) STK_CST
		    From Ias_Itm_Mst M,Ias_Itm_Dtl D,IAS_V_ITM_AVL_QTY a ,Ias_Item_Price b
		   where M.i_code=D.i_code
		    and  M.i_code=a.i_code(+)
		    --and  a.w_code=nvl(:P_WCode,a.w_code)
		    and ( a.w_code=Nvl(:P_WCode,a.w_code) Or Nvl(M.Service_itm,0)=1 )
		    and m.i_code=b.i_code
		    and d.i_code=b.i_code
		    and d.itm_unt=b.itm_unt
		    And b.Lev_no=:P_lev_no
		    and b.i_price>0
		    and (Case
		      When Nvl(M.Use_exp_date,0)=0 Then 1
		      When Nvl(M.Use_exp_date,0)=1 And nvl(avl_qty,0)>0 Then 1
		      When Nvl(M.Use_exp_date,0)=1 And nvl(avl_qty,0)=0 And to_date(a.Expire_date,''DD/MM/YYYY'') >to_date(sysdate,''DD/MM/YYYY'') Then 1
		      Else 0 End)=1
		    and nvl(d.no_sale,0) = 0
		    and nvl(m.inactive,0) = 0
		    and nvl(m.Use_serialno,0) = 0
		    and upper(m.I_Code) Like ''%''||upper(Nvl(:P_Icode,m.I_Code))||''%''
		    and upper(m.I_Name) Like ''%''||upper(Nvl(:P_Iname,m.I_Name))||''%''
		    and  exists (select 1 From privilege_gc
				 where u_id = :p_user_no
				   and g_code = m.g_code
				   and nvl(add_flag,0) = 1
				   and rownum <= 1) '
				   || V_Whr
  Using P_Lang_No,
       P_No_Of_Dcml,
	P_Acy,
	P_Loc_Cur,
	P_Ac_Rate,
	P_No_Of_Dcml,
	P_Shw_Cst,
	P_Wtavg_Type,
	P_Wcode,
	P_Stk_Rate,
	P_Ac_Rate,
	P_WCode,
	P_lev_no,
	P_Icode,
	P_Iname,
	p_user_no;
 End If;
Exception
   When Others Then
      Raise_Application_Error (-20003,
			       'Error When Query From item detail data	' || Sqlerrm
			      );
End Get_Itm_Dtl_Serch;
--##-----------------------------------------------------------------------------------------##--
PROCEDURE FTCH_DATA_LST_SCR ( SQL_CV	      IN OUT T_CV,
			      P_LST_SQL     IN VARCHAR2,
			      P_LST_SRCH   IN VARCHAR2,
			      P_LST_ORDR   IN VARCHAR2,
			      P_LANG_NO    IN NUMBER  DEFAULT 1,
			      P_USER_NO      IN USER_R.U_ID%TYPE,
			      P_WHR	      IN VARCHAR2,
			      P_WHR_FLD   IN VARCHAR2) IS
      V_LST_SQL S_LOV_SLCT.LOV_SQL%TYPE;
      V_LST_ORDR Varchar2(1000);
    BEGIN
       -------------------------------------------------------------
       V_LST_SQL :=  REPLACE(P_LST_SQL,':PARAMETER.LANG_NO',P_LANG_NO);
       V_LST_SQL := REPLACE(p_LST_SQL,':PARAMETER.USER_NO',P_USER_NO);
       -------------------------------------------------------------
       If P_LST_ORDR = '0' --And P_LST_SRCH Is Null
       Then
	  V_LST_ORDR := '';
       Else

	  V_LST_ORDR := ' ORDER BY '||nvl(P_LST_ORDR,'FLD1');
       End If;
       -------------------------------------------------------------
	 OPEN SQL_CV FOR
	       'SELECT FLD1,FLD2,FLD3,FLD4,FLD5,FLD6,FLD7,FLD8,FLD9,FLD10,FLD11,FLD12,FLD13,FLD14,FLD15,FLD16,FLD17,FLD18,FLD19,FLD20
		  FROM ('||V_LST_SQL||' '||P_WHR||')
		WHERE UPPER(FLD1||FLD2||FLD3||FLD4||FLD5||FLD6||FLD7||FLD8||FLD9||FLD10||FLD11||FLD12||FLD13||FLD14||FLD15||FLD16||FLD17||FLD18||FLD19||FLD20)
		  LIKE ''%''||UPPER(:P_LST_SRCH)||''%'' '
		   ||P_WHR_FLD||''||V_LST_ORDR
		    USING UPPER(P_LST_SRCH) ;
    END FTCH_DATA_LST_SCR;
--##-----------------------------------------------------------------------------------------##--
End IAS_Fetch_Data_Pkg;
/
