-- =============================================
-- PACKAGE SPEC: IAS_QT_PRM_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE Ias_Qt_Prm_Pkg AS
 TYPE TP_DYN_REC   IS RECORD (QUOT_NO	       NUMBER,
				    QUOT_SER	     VARCHAR2(30),
				    F_DATE	     DATE,
				    T_DATE	     DATE,
				    QT_PRM_TYPE      NUMBER(5),
				    QT_PRM_TYPE_NM   VARCHAR2(100),
				    QT_PRM_METHOD    NUMBER(5),
				    QT_PRM_METHOD_NM VARCHAR2(100),
				    A_DESC	     VARCHAR2(500));
      TYPE TP_DYN_RFC  IS REF CURSOR;
      G_DYN_REC        TP_DYN_REC;
      TYPE TP_DYN_TBL  IS TABLE OF TP_DYN_REC ;
  PROCEDURE Ias_Get_Qt_Prm (P_Date	    In	Date,
						P_Icode 	In  Varchar2,
						P_ItmUnt	In  Varchar2,
						P_Wcode 	In  Number,
						P_Batch_No	In  Varchar2,
						P_Exp_Date	In  Date,
						P_Iqty		In  Number,
						P_IPrice	In  Number,
						P_Bill_Amt	In  Number,
						P_Bill_Amt_Bfr	In  Number Default Null,
						P_Bill_Rate	In  Number,
						P_Bill_Doc_Type In  Number Default Null ,
						P_C_Code	In  Varchar2,
						P_C_Group_Code	In  Number,
						P_C_Class	In  Number,
						P_C_Degree	In  Number,
						P_C_Code_Csh	In  Varchar2,
						P_Cst_Grp_Csh	In  Number,
						P_Doc_Seq_Tmp	In  Number,
						P_Rcrd_No	In  Number,
						P_Chk_Qt_Ser	In  Number Default Null ,
						P_Cr_Bnk_No1	In  Number Default Null,
						P_Cr_Bnk_No2	In  Number Default Null,
						P_Cr_Bnk_No3	In  Number Default Null,
						P_BRN_NO	In  Number Default Null,
						P_Qt_Prm_Type	Out Number,
						P_Qt_Prm_Method Out Number,
						P_Qt_Prm_Itm_Type Out Number,
						P_Qt_Prm_Cst_Type Out Number,
						P_Qt_No 	Out Number,
						P_Qt_Ser	Out Number,
						P_Qt_Icode	Out Varchar2,
						P_Qt_Itm_Unt	Out Varchar2,
						P_Qt_Rcrd_No	Out Number,
						P_Dis_Per	Out Number,
						P_Dis_Amt	Out Number,
						P_Price 	Out Number,
						P_Fqty		Out Number,
						P_Card_Amt	Out Number,
						P_Qt_Rem_Qty	Out Number,
						P_Apprvd_Freeqty_As_Dscnt Out Number,
						P_Prm_Grp_No	Out Number,
						P_LEV_NO	In  Number Default Null ,
	    P_No_Of_Dcml    In	Number) ;
   FUNCTION  Ias_Get_Qt_Prm_Type ( P_Qt_Ser In	Number) RETURN Number;
   FUNCTION  Ias_Get_Qt_Prm_Method ( P_Qt_Ser In  Number) RETURN Number;
   FUNCTION  Ias_Get_Qt_Prm_Fqty ( P_Qt_Ser In	Number , P_Qt_Rcrd_No In  Number,P_Icode Varchar2) RETURN Number;
   FUNCTION  Chk_Qt_Prm_Disc ( P_Qt_Ser In  Number ) RETURN Number;
   FUNCTION  Chk_Qt_Prm_Free_Qty ( P_Qt_Ser In	Number ) RETURN Number;
   PROCEDURE IAS_Calc_Quot_Prm_Prc ( P_Doc_Srl	    In Ias_Pos_Bill_Mst.Bill_No%Type ,
				    P_Doc_Seq	    Ias_Pos_Hung_Bills.Bill_Seq%Type,
				    P_Date	    In Date ,
				    P_Bill_Doc_Type IN NUMBER ,
				    P_No_Of_Dcml    In Number,
				    P_FND_PRM	    OUT NUMBER,
				    P_C_Code	    In Varchar2,
									P_C_Group_Code	In Number,
									P_C_Class	In Number,
									P_C_Degree	In Number,
									P_C_Code_Csh	In Varchar2,
									P_Cst_Grp_Csh	In Number,
									P_Cr_Bnk_No1	In Number Default Null ) ;
   PROCEDURE IAS_Calc_Rt_Quot_Prm_Prc ( P_Doc_Srl  In Ias_Pos_Rt_Bill_Mst.Rt_Bill_No%Type ,P_Bill_NO In Ias_Pos_Rt_Bill_Mst.Bill_No%Type,P_Date In Date , P_Bill_Doc_Type IN NUMBER , P_No_Of_Dcml In Number,P_Disc_Amt_Bill_Prm In Number,P_FND_PRM OUT NUMBER) ;
   FUNCTION  GET_BILL_PRICE_FOR_RPLC_PRM (P_Bill_no  In Ias_Pos_Bill_Mst.Bill_No%Type ,P_Doc_Seq Ias_Pos_Hung_Bills.Bill_Seq%Type , P_Qt_Ser In  Number) RETURN Number;
   PROCEDURE IAS_Clc_Qtn_Prm_Grp_Prc(P_Bill_No	     In Ias_Pos_Bill_Mst.Bill_No%Type ,
				    P_Bill_Seq	    In Ias_Pos_Hung_Bills.Bill_Seq%Type,
				    P_Date	    In Date ,
				    P_Bill_Doc_Type In Number ,
				    P_C_Code	    In Varchar2,
				    P_C_Group_Code  In Number,
				    P_C_Class	    In Number,
				    P_C_Degree	    In Number,
				    P_C_Code_Csh    In Varchar2,
				    P_Cst_Grp_Csh   In Number,
				    P_Cr_Bnk_No1    In Number Default Null,
				    P_Bill_Rate     In Number,
				    P_Chk_Qt_Ser    In Number Default Null,
				    P_No_Of_Dcml    In Number
				    );
  PROCEDURE IAS_Clc_Qtn_Prm_Grp_Rt_Prc(P_Rt_Bill_No  In Ias_Pos_Rt_Bill_Mst.Rt_Bill_No%Type ,
				    P_Bill_Seq	    In Ias_pos_rt_bill_dtl_tmp.Bill_Seq%Type,
				    P_Date	    In Date ,
				    P_Bill_Doc_Type In Number ,
				    P_C_Code	    In	Varchar2,
				    P_C_Group_Code  In	Number,
				    P_C_Class	    In	Number,
				    P_C_Degree	    In	Number,
				    P_No_Of_Dcml    In Number) ;
	PROCEDURE  Get_Prm_Grp_Icode (P_Prm_Grp_No	  In Ias_Qut_Prm_Grp_Mst.Prm_Grp_No%Type,
					    P_Grnt_Free_Qty_Typ In Ias_Qut_Prm_Grp_Mst.Grnt_Free_Qty_Typ%Type,
					    P_Qt_I_Code 	In Out Ias_Qut_Prm_Dtl.Qt_I_Code%Type,
					    P_Qt_Itm_Unt	In Out Ias_Qut_Prm_Dtl.Qt_Itm_Unt%Type);
  PROCEDURE GET_Qt_Prm_Bill_Grp_Prc(P_BILL_NO  In Number,
			    P_BILL_SEQ	      In  Number,
			    P_Wcode	      In  Number,
			    P_Icode	      In  Varchar2,
			    P_Qt_Ser	      Out Number,
			    P_Qt_No	      Out Number,
			    P_Qt_Prm_Type     Out Number,
			    P_Qt_Prm_Method   Out Number,
			    P_Qt_Prm_Itm_Type Out Number,
			    P_Dis_Per	      Out Number,
			    P_Dis_Amt	      Out Number) ;		
  PROCEDURE Get_Qt_Prm_Data_Prc(P_Icode        In  Varchar2,
				P_ItmUnt	In  Varchar2,
				      P_Wcode	      In  Number,
				      P_C_Code	      In  Varchar2,
				      P_C_Group_Code  In  Number,
				      P_C_Class       In  Number,
				      P_C_Degree      In  Number,
				      P_C_Code_Csh    In  Varchar2,
				      P_Cst_Grp_Csh   In  Number,
				      P_Qt_Prm_Ser    Out Number);	
 FUNCTION  DYN_QT_PRM_DUP_IC_VW (  P_date		 In  Date,
				   P_Icode		 In  Varchar2,
				   P_Itm_Unt		 In  Varchar2,
				   P_Wcode		 In  Number,
				   P_Batch_No		 In  Varchar2,
				   P_Exp_Date		 In  Date,
				   P_Bill_Doc_Type	 In  Number ,
				   P_C_Code		 In  Varchar2,
				   P_C_Code_Csh 	 In  Varchar2,
				   P_Chk_Qt_No		 In  Number Default Null ,
				   P_Chk_Qt_Ser 	 In  Number Default Null ,
				   P_Sys_Typ		 In  Number	     ,
				   P_Lang_No		 In  Number Default 1)
				   RETURN TP_DYN_TBL PIPELINED;												 		
END Ias_Qt_Prm_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_QT_PRM_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE  BODY Ias_Qt_Prm_Pkg AS
   PROCEDURE Ias_Get_Qt_Prm(P_Date	     In  Date,
				P_Icode 	In  Varchar2,
				P_ItmUnt	In  Varchar2,
				P_Wcode 	In  Number,
				P_Batch_No	In  Varchar2,
				P_Exp_Date	In  Date,
				P_Iqty		In  Number,
				P_IPrice	In  Number,
				P_Bill_Amt	In  Number,
				P_Bill_Amt_Bfr	In  Number Default Null,
				P_Bill_Rate	In  Number,
				P_Bill_Doc_Type In  Number Default Null ,
				P_C_Code	In  Varchar2,
				P_C_Group_Code	In  Number,
				P_C_Class	In  Number,
				P_C_Degree	In  Number,
				P_C_Code_Csh	In  Varchar2,
				P_Cst_Grp_Csh	In  Number,
				P_Doc_Seq_Tmp	In  Number,
				P_Rcrd_No	In  Number,
				P_Chk_Qt_Ser	In  Number Default Null ,
				P_Cr_Bnk_No1	In  Number Default Null,
				P_Cr_Bnk_No2	In  Number Default Null,
				P_Cr_Bnk_No3	In  Number Default Null,
				P_BRN_NO	In  Number Default Null,
				P_Qt_Prm_Type	Out Number,
				P_Qt_Prm_Method Out Number,
				P_Qt_Prm_Itm_Type Out Number,
				P_Qt_Prm_Cst_Type Out Number,
				P_Qt_No 	Out Number,
				P_Qt_Ser	Out Number,
				P_Qt_Icode	Out Varchar2,
				P_Qt_Itm_Unt	Out Varchar2,
				P_Qt_Rcrd_No	Out Number,
				P_Dis_Per	Out Number,
				P_Dis_Amt	Out Number,
				P_Price 	Out Number,
				P_Fqty		Out Number,
				P_Card_Amt	Out Number,
				P_Qt_Rem_Qty	Out Number,
				P_Apprvd_Freeqty_As_Dscnt Out Number,
				P_Prm_Grp_No	Out Number,
				P_LEV_NO	In  Number Default Null ,
	P_No_Of_Dcml	In  Number) IS
      V_Whr		Varchar2(3000);
      V_Qt_Qty		Number;
      V_Qt_Qty_Bill	Number;
      V_Qt_Qty_Bill_H	Number;
      V_I_Qty_Bill	Number;
      V_By_Comp_Qty	Number;
      V_Calc_All_Slides Number;
      V_Iqty_Cmltv	Number;
      V_Max_Qt_Qty_Doc	Number;
      V_Avg_Price	Number;
      V_Qty		Number:=0;
      V_MQty		Number:=0;
      V_Max_Qty 	Number:=0;
      V_Use_Qty_Fraction Number:=0;
      V_Wh_G_Code	 Number;
    BEGIN
     Begin
	SELECT WHG_CODE
	  Into V_Wh_G_code
	  FROM WAREHOUSE_DETAILS
	 WHERE W_CODE = P_WCODE;
     Exception When Others Then
	V_Wh_G_code:=Null;
     End;
     Select Quot_No,
	    Quot_Ser,
	    Qt_Prm_Type,
	    Qt_Prm_Method,
	    Qt_Prm_Itm_Type,
	    Qt_Prm_Cst_Type,
	    Qt_I_Code,
	    Qt_Itm_Unt,
	    Rcrd_No,
	    Dis_Per,
	    Dis_Amt,
	    Price,
	    Free_Qty,
	    Qt_Qty,
	    Card_Amt,
	    By_Comp_Qty,
	    Calc_All_Slides,
	    Prm_Grp_No,
	    APPRVD_FREEQTY_AS_DSCNT,
	    Max_Qt_Qty_Doc
       InTo P_Qt_No,
	    P_Qt_Ser,
	    P_Qt_Prm_Type,
	    P_Qt_Prm_Method,
	    P_Qt_Prm_Itm_Type,
	    P_Qt_Prm_Cst_Type,
	    P_Qt_Icode,
	    P_Qt_Itm_Unt,
	    P_Qt_Rcrd_No,
	    P_Dis_Per,
	    P_Dis_Amt,
	    P_Price,
	    P_Fqty,
	    V_Qt_Qty,
	    P_Card_Amt,
	    V_By_Comp_Qty,
	    V_Calc_All_Slides,
	    P_Prm_Grp_No,
	    P_APPRVD_FREEQTY_AS_DSCNT,
	    V_Max_Qt_Qty_Doc
     From ( Select Ias_Qut_Prm_Mst.Quot_No,
	    Ias_Qut_Prm_Mst.Quot_Ser,
	    Ias_Qut_Prm_Mst.Qt_Prm_Type,
	    Ias_Qut_Prm_Mst.Qt_Prm_Method,
	    Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type,
	    Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type,
	    Ias_Qut_Prm_Dtl.Qt_I_Code,
	    Ias_Qut_Prm_Dtl.Qt_Itm_Unt,
	    Ias_Qut_Prm_Dtl.Rcrd_No,
	    (Case When Ias_Qut_Prm_Mst.Qt_Prm_Method=Decode(Ias_Qut_Prm_Mst.Qt_Prm_Type,3,1,2) And Disc_type=1 Then Ias_Qut_Prm_Dtl.Disc_Amt_Per Else Null End) Dis_Per,
	    (Case When Ias_Qut_Prm_Mst.Qt_Prm_Method=Decode(Ias_Qut_Prm_Mst.Qt_Prm_Type,3,1,2) And Disc_type=2 Then
	     ROUND(Nvl(Ias_Qut_Prm_Dtl.Disc_Amt_Per,0) * Nvl(Ias_Gen_Pkg.Get_Cur_rate(Ias_Qut_Prm_Mst.Quot_cur)/P_Bill_Rate,0),P_No_Of_Dcml) Else Null End) Dis_Amt,
	    Nvl(Ias_Qut_Prm_Dtl.I_Price,0) * Nvl(round(Ias_Gen_Pkg.Get_Cur_rate(Ias_Qut_Prm_Mst.Quot_cur)/P_Bill_Rate,P_No_Of_Dcml),0) Price,
	    Ias_Qut_Prm_Dtl.Free_Qty,
	    Ias_Qut_Prm_Dtl.Qt_Qty,
	    Ias_Qut_Prm_Dtl.Card_Amt,
	    Nvl(By_Comp_Qty,0) By_Comp_Qty,
	    Nvl(Calc_All_Slides,0) Calc_All_Slides,
	    Prm_Grp_No,
	    APPRVD_FREEQTY_AS_DSCNT,
	    Max_Qt_Qty_Doc
      From Ias_Qut_Prm_Mst,Ias_Qut_Prm_Dtl
     Where Ias_Qut_Prm_Mst.Quot_Ser = Ias_Qut_Prm_Dtl.Quot_Ser
       And Ias_Qut_Prm_Mst.Quot_Ser = Nvl(P_Chk_Qt_Ser,Ias_Qut_Prm_Mst.Quot_Ser)
       And (Case
		 When Ias_Qut_Prm_Mst.Qt_Prm_Type=1 And Ias_Qut_Prm_Dtl.I_Code=P_Icode And Ias_Qut_Prm_Dtl.Itm_Unt=P_ItmUnt And Nvl(By_Comp_Qty,0)=0 Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Type=1 And Ias_Qut_Prm_Dtl.I_Code=P_Icode And Ias_Qut_Prm_Dtl.Itm_Unt=P_ItmUnt And Nvl(By_Comp_Qty,0)=1 And Mod(P_Iqty,COMP_QTY)=0 Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Type=2 And Ias_Qut_Prm_Dtl.I_Code=P_Icode And Ias_Qut_Prm_Dtl.Itm_Unt=P_ItmUnt And P_Iqty Between Ias_Qut_Prm_Dtl.F_Qty And Ias_Qut_Prm_Dtl.T_Qty Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Type=2 And Ias_Qut_Prm_Mst.Qt_Prm_Method=4 and Ias_Qut_Prm_Dtl.I_Code=P_Icode And Ias_Qut_Prm_Dtl.Itm_Unt=P_ItmUnt And Nvl(By_Comp_Qty,0)=1 And Nvl(Cmltv_Mnth_Flg,0)=1 Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Type=3 And P_Icode is null And Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type Is Null
							    And P_Bill_Amt  Between Nvl(round(Ias_Qut_Prm_Dtl.F_Amt * Ias_Gen_Pkg.Get_Cur_rate(Ias_Qut_Prm_Mst.Quot_cur)/P_Bill_Rate,P_No_Of_Dcml),0)
										And Nvl(round(Ias_Qut_Prm_Dtl.T_Amt * Ias_Gen_Pkg.Get_Cur_rate(Ias_Qut_Prm_Mst.Quot_cur)/P_Bill_Rate,P_No_Of_Dcml),0) Then 1	
		 When Ias_Qut_Prm_Mst.Qt_Prm_Type=3 And P_Icode is null And Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type Is Not Null Then 1
		 Else 0 End)=1
	And (Case
		  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=0 Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=1 And Ias_Qut_Prm_Dtl.W_Code   = P_Wcode Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=2 And Ias_Qut_Prm_Dtl.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=3 And Ias_Qut_Prm_Dtl.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=4 And Ias_Qut_Prm_Dtl.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=5 And Ias_Qut_Prm_Dtl.City_No  =(Select City_No  From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=6 And Ias_Qut_Prm_Dtl.R_Code   =(Select R_Code   From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
		  Else 0 End)=1
	And (Case
		  When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=0 Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=1 And Ias_Qut_Prm_Dtl.C_Code	  = P_C_Code	   Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=2 And Ias_Qut_Prm_Dtl.C_Group_Code = P_C_Group_Code Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=3 And Ias_Qut_Prm_Dtl.C_Class	  = P_C_Class	   Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=4 And Ias_Qut_Prm_Dtl.C_Degree	  = P_C_Degree	   Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=5 And P_c_code_csh Is Not Null Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=6 And Ias_Qut_Prm_Dtl.Bank_no =P_Cr_Bnk_No1   Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=7 And Ias_Qut_Prm_Dtl.Cust_Grp_Code= P_Cst_Grp_Csh  Then 1
		  When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=8 And Ias_Qut_Prm_Dtl.C_Code_Csh   = P_c_code_csh   Then 1
		  Else 0 End)=1
       And (Case When Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type Is Null Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type=1 And Ias_Qut_Prm_Dtl.G_Code=(Select G_Code From Ias_Itm_mst Where I_Code=P_Icode And RowNum<=1) Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type=2 And Ias_Qut_Prm_Dtl.Mng_Code=(Select Nvl(Mng_Code,'0') From Ias_Itm_mst Where I_Code=P_Icode And RowNum<=1) Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type=3 And Ias_Qut_Prm_Dtl.Subg_Code=(Select Nvl(Subg_Code,'0') From Ias_Itm_mst Where I_Code=P_Icode And RowNum<=1) Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type=4 And Ias_Qut_Prm_Dtl.Assistant_No=(Select Nvl(Assistant_No,'0') From Ias_Itm_mst Where I_Code=P_Icode And RowNum<=1) Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type=5 And Ias_Qut_Prm_Dtl.Detail_No=(Select Nvl(Detail_No,'0') From Ias_Itm_mst Where I_Code=P_Icode And RowNum<=1) Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type=6 And Ias_Qut_Prm_Dtl.Group_No=(Select Nvl(Group_No,0) From Ias_Itm_mst Where I_Code=P_Icode And RowNum<=1) Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type=7 And Ias_Qut_Prm_Dtl.Item_Type=(Select Nvl(Item_Type,0) From Ias_Itm_mst Where I_Code=P_Icode And RowNum<=1) Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type=8 And Ias_Qut_Prm_Dtl.Grp_Class_Code=(Select nvl(Grp_Class_Code,'0') From Ias_Itm_mst Where I_Code=P_Icode And RowNum<=1) Then 1
		 When Ias_Qut_Prm_Mst.Qt_Prm_Itm_Type=9 And Exists(Select 1 From Ias_Qut_Prm_Grp_Dtl Where Prm_Grp_No=Ias_Qut_Prm_Dtl.Prm_Grp_No And I_Code=P_Icode And RowNum<=1) Then 1
		 Else 0 End)=1
       And Not EXISTS (
		SELECT 1
		FROM IAS_QUT_PRM_CSTMZ
		WHERE QUOT_SER= IAS_QUT_PRM_MST.QUOT_SER
		GROUP BY CSTMZ_TYP
		HAVING SUM(
		       CASE
			 WHEN (CSTMZ_TYP=1 AND CSTMZ_CODE =P_BRN_NO)
			   OR (CSTMZ_TYP=2 AND CSTMZ_CODE =P_WCODE)
			   OR (CSTMZ_TYP=3 AND	CSTMZ_CODE=V_WH_G_CODE)
			   OR (CSTMZ_TYP=4 AND	CSTMZ_CODE=P_C_GROUP_CODE)
			   OR (CSTMZ_TYP=5 AND	CSTMZ_CODE=P_C_CLASS)
			   OR (CSTMZ_TYP=6 AND	CSTMZ_CODE=P_C_DEGREE)
			   OR (CSTMZ_TYP=7 AND	CSTMZ_CODE=P_CST_GRP_CSH)
			 THEN 1
			 ELSE 0
		       END
		     ) = 0 )
       And (Case
		 When NVL(Ias_Qut_Prm_Mst.BY_LEV_NO,0) =0 Then 1
		 When NVL(Ias_Qut_Prm_Mst.BY_LEV_NO,0) =1 And Ias_Qut_Prm_Dtl.LEV_NO = P_LEV_NO  Then 1
		 Else 0 End)=1
       And (Case When Qt_Prm_Cst_Type In (2,3,4) And P_C_Code Is Not Null
       And P_C_Code In (Select C_Code
		     From Ias_Cst_Expt_Qut_Prm
		    Where Quot_Ser=Ias_Qut_Prm_Mst.Quot_Ser) Then 0 Else 1 End)=1
       And Nvl(Ias_Qut_Prm_Mst.Inactive,0)=0
       And Nvl(Ias_Qut_Prm_Mst.APPROVED,0)= 1
       And P_Bill_Doc_Type = Decode(Ias_Qut_Prm_Mst.Bill_Doc_Type,Null,P_Bill_Doc_Type,Ias_Qut_Prm_Mst.Bill_Doc_Type)
       And P_date Between F_Date And T_Date
       And To_Char(To_Date(P_date),'D') In (Fld_Day1,Fld_Day2,Fld_Day3,Fld_Day4,Fld_Day5,Fld_Day6,Fld_Day7)
       --And To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') >= Nvl(Ias_Qut_Prm_Mst.F_Time,To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS'))
       --And To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') <= Nvl(Ias_Qut_Prm_Mst.T_Time,To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS'))
       And (CASE WHEN IAS_QUT_PRM_MST.F_Time IS NULL  OR IAS_QUT_PRM_MST.F_Time IS NULL THEN 1
							   WHEN IAS_QUT_PRM_MST.F_Time <=IAS_QUT_PRM_MST.T_Time  AND To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') BETWEEN IAS_QUT_PRM_MST.F_Time AND IAS_QUT_PRM_MST.T_Time THEN 1
							   WHEN IAS_QUT_PRM_MST.F_Time > IAS_QUT_PRM_MST.T_Time  AND (To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') > IAS_QUT_PRM_MST.F_Time OR To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') < IAS_QUT_PRM_MST.T_Time ) THEN 1
			      ELSE 0
					  End)=1
       And Nvl(Ias_Qut_Prm_Dtl.Batch_No,'0')= Decode(Nvl(Ias_Qut_Prm_Dtl.Batch_No,'0'),'0',Nvl(Ias_Qut_Prm_Dtl.Batch_No,'0'),Nvl(P_Batch_No,'0'))
       And Nvl(Ias_Qut_Prm_Dtl.Expire_Date,'01/01/1900')=Decode(Nvl(Ias_Qut_Prm_Dtl.Expire_Date,'01/01/1900'),'01/01/1900',Nvl(Ias_Qut_Prm_Dtl.Expire_Date,'01/01/1900'),Nvl(P_Exp_Date,'01/01/1900'))
       And Nvl(Ias_Qut_Prm_Mst.Use_qtn_prm_in_pos_sys_flg,0)=1
	And 1=( Case When Nvl(Ias_Qut_Prm_Mst.By_Invc_Amt_Flg,0) = 1 AND Nvl(Ias_Qut_Prm_Mst.MTHD_CLC_INVC_AMT,1) = 1 And Ias_Qut_Prm_Dtl.Bill_Amt Is Not Null And Nvl(P_Bill_Amt,0) >= Nvl(round(Ias_Qut_Prm_Dtl.Bill_Amt * Ias_Gen_Pkg.Get_Cur_rate(Ias_Qut_Prm_Mst.Quot_cur)/P_Bill_Rate,P_No_Of_Dcml),0) Then 1
		    When Nvl(Ias_Qut_Prm_Mst.By_Invc_Amt_Flg,0) = 1 AND Nvl(Ias_Qut_Prm_Mst.MTHD_CLC_INVC_AMT,1) = 2 And Ias_Qut_Prm_Dtl.Bill_Amt Is Not Null And Nvl(P_Bill_Amt_Bfr,0) >= Nvl(round(Ias_Qut_Prm_Dtl.Bill_Amt * Ias_Gen_Pkg.Get_Cur_rate(Ias_Qut_Prm_Mst.Quot_cur)/P_Bill_Rate,P_No_Of_Dcml),0) Then 1
		    When Nvl(Ias_Qut_Prm_Mst.By_Invc_Amt_Flg,0)=0 Then 1 End)
       --And Decode(Ias_Qut_Prm_Dtl.W_Code,Null,P_Wcode,Ias_Qut_Prm_Dtl.W_Code)=P_Wcode
       Order By Decode(Nvl(Ias_Qut_Prm_Mst.By_Invc_Amt_Flg,0) ,1,Ias_Qut_Prm_Dtl.Bill_Amt)  Desc ,Ias_Qut_Prm_Mst.Quot_No
	)
       Where RowNum <=1;

       If P_Qt_Ser Is Not Null	And P_Qt_Rcrd_No Is Not Null And P_Qt_Prm_Type in (1,2) And P_Qt_Prm_Method<5 Then
	    If V_Qt_Qty Is Not Null Then
	     BEGIN
	       Select Nvl(Sum(Nvl(I_Qty,0)+Nvl(Free_Qty,0)),0) InTo V_Qt_Qty_Bill From Ias_POS_Bill_Dtl Where Qt_Prm_Ser=P_Qt_Ser And Qt_Prm_Rcrd_No=P_Qt_Rcrd_No;
	     EXCEPTION WHEN OTHERS THEN V_Qt_Qty_Bill:=0;
	     END;
	     BEGIN
	       Select Nvl(Sum(Nvl(I_Qty,0)+Nvl(Free_Qty,0)),0) InTo V_Qt_Qty_Bill_H From Ias_Pos_Hst_Bill_Dtl Where Qt_Prm_Ser=P_Qt_Ser And Qt_Prm_Rcrd_No=P_Qt_Rcrd_No;
	     EXCEPTION WHEN OTHERS THEN V_Qt_Qty_Bill_H:=0;
	     END;
	     BEGIN
		Select Sum(Nvl(I_Qty,0)) InTo V_I_Qty_Bill From Ias_Pos_Hung_Bills Where I_Code=P_Icode And Itm_Unt=P_Itmunt And Bill_seq=P_doc_seq_tmp And Rcrd_no<>P_Rcrd_No;
	     EXCEPTION WHEN OTHERS THEN
		V_I_Qty_Bill := 0;
	     END;
	     V_Qt_Qty_Bill :=Nvl(V_Qt_Qty_Bill,0)+Nvl(V_Qt_Qty_Bill_H,0)+NVL(V_I_Qty_Bill,0);
	   End If;
       If V_By_Comp_Qty=1 Or V_Calc_All_Slides=1 Then	
	       If P_Qt_Ser Is Not Null And P_Qt_Prm_Type=2 And P_Qt_Prm_Method in(3,4) Then
		     SELECT (SUM(
			CASE
			    WHEN IAS_QUT_PRM_DTL.T_QTY <= P_IQTY AND V_CALC_ALL_SLIDES = 1 THEN TRUNC((T_QTY - F_QTY + 1) / DECODE(V_BY_COMP_QTY, 1, COMP_QTY, (T_QTY - F_QTY + 1))) * FREE_QTY
			    WHEN IAS_QUT_PRM_DTL.T_QTY > P_IQTY AND V_CALC_ALL_SLIDES = 1 THEN TRUNC((P_IQTY - F_QTY + 1) / DECODE(V_BY_COMP_QTY, 1, COMP_QTY, (T_QTY - F_QTY + 1))) * FREE_QTY
			    WHEN V_CALC_ALL_SLIDES = 0 AND (P_IQTY BETWEEN IAS_QUT_PRM_DTL.F_QTY AND IAS_QUT_PRM_DTL.T_QTY) AND V_CALC_ALL_SLIDES = 0 THEN (TRUNC(P_IQTY / COMP_QTY) * FREE_QTY)
			END)),
			     NVL(USE_QTY_FRACTION, 0)
		  INTO P_FQTY, V_USE_QTY_FRACTION
		      From Ias_Qut_Prm_Mst,Ias_Qut_Prm_Dtl, IAS_ITM_MST
		     Where Ias_Qut_Prm_Mst.Quot_Ser =Ias_Qut_Prm_Dtl.Quot_Ser
		       And Ias_Qut_Prm_Dtl.I_Code = IAS_ITM_MST.I_Code
		       And Ias_Qut_Prm_Mst.Quot_Ser =P_Qt_Ser
		       And Ias_Qut_Prm_Dtl.I_Code   =P_Icode
		 And Ias_Qut_Prm_Dtl.Itm_Unt  =P_ItmUnt
		 And Nvl(Ias_Qut_Prm_Dtl.Batch_No,'0')= Decode(Nvl(Ias_Qut_Prm_Dtl.Batch_No,'0'),'0',Nvl(Ias_Qut_Prm_Dtl.Batch_No,'0'),Nvl(P_Batch_No,'0'))
		 And Nvl(Ias_Qut_Prm_Dtl.Expire_Date,'01/01/1900')=Decode(Nvl(Ias_Qut_Prm_Dtl.Expire_Date,'01/01/1900'),'01/01/1900',Nvl(Ias_Qut_Prm_Dtl.Expire_Date,'01/01/1900'),Nvl(P_Exp_Date,'01/01/1900'))
		       And Ias_Qut_Prm_Dtl.F_Qty<=P_Iqty
		       And (Case When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=0 Then 1
				       When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=1 And Ias_Qut_Prm_Dtl.C_Code       = P_C_Code	Then 1
				       When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=2 And Ias_Qut_Prm_Dtl.C_Group_Code = P_C_Group_Code Then 1
				       When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=3 And Ias_Qut_Prm_Dtl.C_Class      = P_C_Class	Then 1
				       When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=4 And Ias_Qut_Prm_Dtl.C_Degree     = P_C_Degree	Then 1
				       When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=5 And P_c_code_csh Is Not Null Then 1
				       When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=6 And Ias_Qut_Prm_Dtl.Bank_no =P_Cr_Bnk_No1  Then 1
				       When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=7 And Ias_Qut_Prm_Dtl.Cust_Grp_Code  = P_Cst_Grp_Csh Then 1
				       When Ias_Qut_Prm_Mst.Qt_Prm_Cst_Type=8 And Ias_Qut_Prm_Dtl.C_Code_Csh	 = P_c_code_csh  Then 1
				       Else 0 End)=1
		And (Case  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=0 Then 1
			  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=1 And Ias_Qut_Prm_Dtl.W_Code   = P_Wcode Then 1
			  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=2 And Ias_Qut_Prm_Dtl.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=3 And Ias_Qut_Prm_Dtl.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=4 And Ias_Qut_Prm_Dtl.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=5 And Ias_Qut_Prm_Dtl.City_No  =(Select City_No  From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=6 And Ias_Qut_Prm_Dtl.R_Code   =(Select R_Code   From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			  Else 0 End)=1
		      AND NOT EXISTS (
		SELECT 1
		FROM IAS_QUT_PRM_CSTMZ
		WHERE QUOT_SER= IAS_QUT_PRM_MST.QUOT_SER
		GROUP BY CSTMZ_TYP
		HAVING SUM(
		       CASE
			 WHEN (CSTMZ_TYP=1 AND CSTMZ_CODE =P_BRN_NO)
			   OR (CSTMZ_TYP=2 AND CSTMZ_CODE =P_WCODE)
			   OR (CSTMZ_TYP=3 AND	CSTMZ_CODE=V_WH_G_CODE)
			   OR (CSTMZ_TYP=4 AND	CSTMZ_CODE=P_C_GROUP_CODE)
			   OR (CSTMZ_TYP=5 AND	CSTMZ_CODE=P_C_CLASS)
			   OR (CSTMZ_TYP=6 AND	CSTMZ_CODE=P_C_DEGREE)
			   OR (CSTMZ_TYP=7 AND	CSTMZ_CODE=P_CST_GRP_CSH)
			 THEN 1
			 ELSE 0
		       END
		     ) = 0 )
		      And (Case
		 When NVL(Ias_Qut_Prm_Mst.BY_LEV_NO,0) =0 Then 1
		 When NVL(Ias_Qut_Prm_Mst.BY_LEV_NO,0) =1 And Ias_Qut_Prm_Dtl.LEV_NO = P_LEV_NO  Then 1
		 Else 0 End)=1
		 GROUP BY NVL(USE_QTY_FRACTION, 0) ;
	      IF V_USE_QTY_FRACTION = 0 THEN
		   P_FQTY := TRUNC(P_FQTY);
	      END IF;
	       ElsIf P_Qt_Ser Is Not Null And P_Qt_Prm_Type=2 And P_Qt_Prm_Method=2 And (V_By_Comp_Qty=1 Or V_Calc_All_Slides=1) Then	
		      Select SUM(Case When Disc_type=1 And  Ias_Qut_Prm_Dtl.T_Qty<=P_Iqty And V_Calc_All_Slides = 1  Then ((TRUNC((T_Qty-F_Qty+1)/Decode(V_By_Comp_Qty,1,Comp_Qty,1))*((Ias_Qut_Prm_Dtl.Disc_Amt_Per)/100))/P_Iqty)*Decode(V_By_Comp_Qty,1,Comp_Qty,1)
				   When Disc_type=1 And Ias_Qut_Prm_Dtl.T_Qty>P_Iqty And V_Calc_All_Slides = 1 Then ((TRUNC((P_Iqty-F_Qty+1)/Decode(V_By_Comp_Qty,1,Comp_Qty,1))*((Ias_Qut_Prm_Dtl.Disc_Amt_Per)/100))/P_Iqty)*Decode(V_By_Comp_Qty,1,Comp_Qty,1)
				   When Disc_type=1  And (P_Iqty Between Ias_Qut_Prm_Dtl.F_Qty And Ias_Qut_Prm_Dtl.T_Qty) And V_Calc_All_Slides=0 Then (TRUNC(P_Iqty/Comp_Qty)*((Ias_Qut_Prm_Dtl.Disc_Amt_Per/(P_Iqty/Comp_Qty))/100))
			      End)*100,
		       SUM(Case When Disc_type=2 And Ias_Qut_Prm_Dtl.T_Qty<=P_Iqty And V_Calc_All_Slides = 1  Then ((TRUNC((T_Qty-F_Qty+1)/Decode(V_By_Comp_Qty,1,Comp_Qty,1))*Ias_Qut_Prm_Dtl.Disc_Amt_Per)/P_Iqty)
				      When Disc_type=2 And Ias_Qut_Prm_Dtl.T_Qty>P_Iqty  And V_Calc_All_Slides = 1  Then ((TRUNC((P_Iqty-F_Qty+1)/Decode(V_By_Comp_Qty,1,Comp_Qty,1))*Ias_Qut_Prm_Dtl.Disc_Amt_Per)/P_Iqty)
				      When Disc_type=2 And (P_Iqty Between Ias_Qut_Prm_Dtl.F_Qty And Ias_Qut_Prm_Dtl.T_Qty) And V_Calc_All_Slides=0 Then (TRUNC(P_Iqty/Comp_Qty)*(Ias_Qut_Prm_Dtl.Disc_Amt_Per/P_Iqty))
			      End)
		       InTo P_Dis_Per,
			    P_Dis_Amt
		      From Ias_Qut_Prm_Mst,Ias_Qut_Prm_Dtl
		     Where Ias_Qut_Prm_Mst.Quot_Ser = Ias_Qut_Prm_Dtl.Quot_Ser
		       And Ias_Qut_Prm_Mst.Quot_Ser = P_Qt_Ser
		       And Ias_Qut_Prm_Dtl.I_Code =P_Icode
		 And Ias_Qut_Prm_Dtl.Itm_Unt=P_ItmUnt
		 And Nvl(Ias_Qut_Prm_Dtl.Batch_No,'0')= Decode(Nvl(Ias_Qut_Prm_Dtl.Batch_No,'0'),'0',Nvl(Ias_Qut_Prm_Dtl.Batch_No,'0'),Nvl(P_Batch_No,'0'))
		 And Nvl(Ias_Qut_Prm_Dtl.Expire_Date,'01/01/1900')=Decode(Nvl(Ias_Qut_Prm_Dtl.Expire_Date,'01/01/1900'),'01/01/1900',Nvl(Ias_Qut_Prm_Dtl.Expire_Date,'01/01/1900'),Nvl(P_Exp_Date,'01/01/1900'))
		       And Ias_Qut_Prm_Dtl.F_Qty<=P_Iqty
		       And (Case  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=0 Then 1
				  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=1 And Ias_Qut_Prm_Dtl.W_Code   = P_Wcode Then 1
				  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=2 And Ias_Qut_Prm_Dtl.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
				  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=3 And Ias_Qut_Prm_Dtl.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
				  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=4 And Ias_Qut_Prm_Dtl.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
				  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=5 And Ias_Qut_Prm_Dtl.City_No  =(Select City_No  From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
				  When Ias_Qut_Prm_Mst.Qt_Prm_Wc_Type=6 And Ias_Qut_Prm_Dtl.R_Code   =(Select R_Code   From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			  Else 0 End)=1
		      And Not EXISTS (
		SELECT 1
		FROM IAS_QUT_PRM_CSTMZ
		WHERE QUOT_SER= IAS_QUT_PRM_MST.QUOT_SER
		GROUP BY CSTMZ_TYP
		HAVING SUM(
		       CASE
			 WHEN (CSTMZ_TYP=1 AND CSTMZ_CODE =P_BRN_NO)
			   OR (CSTMZ_TYP=2 AND CSTMZ_CODE =P_WCODE)
			   OR (CSTMZ_TYP=3 AND	CSTMZ_CODE=V_WH_G_CODE)
			   OR (CSTMZ_TYP=4 AND	CSTMZ_CODE=P_C_GROUP_CODE)
			   OR (CSTMZ_TYP=5 AND	CSTMZ_CODE=P_C_CLASS)
			   OR (CSTMZ_TYP=6 AND	CSTMZ_CODE=P_C_DEGREE)
			   OR (CSTMZ_TYP=7 AND	CSTMZ_CODE=P_CST_GRP_CSH)
			 THEN 1
			 ELSE 0
		       END
		     ) = 0 )	
		       And (Case
		   When NVL(Ias_Qut_Prm_Mst.BY_LEV_NO,0) =0 Then 1
		   When NVL(Ias_Qut_Prm_Mst.BY_LEV_NO,0) =1 And Ias_Qut_Prm_Dtl.LEV_NO = P_LEV_NO  Then 1
		   Else 0 End)=1 ;
	       ElsIf P_Qt_Ser Is Not Null And P_Qt_Prm_Type=2 And P_Qt_Prm_Method=1 And V_Calc_All_Slides=1 Then
		  Begin
		    Select Sum(Nvl(I_Qty,0)) InTo V_Iqty_Cmltv From Ias_Pos_Hung_Bills Where I_Code=P_Icode And Itm_Unt=P_ItmUnt And Bill_Seq = P_Doc_Seq_Tmp And Rcrd_No <=P_Rcrd_No; --Or Rcrd_No=1 ;
		  Exception WHen Others Then V_Iqty_Cmltv := 0;
		  End;

		  V_Avg_Price:=0;

		  For I In Nvl(V_Iqty_Cmltv,0)-Nvl(P_Iqty,0)+1..Nvl(V_Iqty_Cmltv,0) Loop
		    Begin
		      Select Nvl(Ias_Qut_Prm_Dtl.I_Price,0)
		       InTo P_Price
		      From Ias_Qut_Prm_Mst,Ias_Qut_Prm_Dtl
		     Where Ias_Qut_Prm_Mst.Quot_Ser = Ias_Qut_Prm_Dtl.Quot_Ser
		       And Ias_Qut_Prm_Mst.Quot_Ser = P_Qt_Ser
		       And Ias_Qut_Prm_Dtl.I_Code=P_Icode
		       And Ias_Qut_Prm_Dtl.Itm_Unt=P_ItmUnt
		       And I Between Ias_Qut_Prm_Dtl.F_Qty And Ias_Qut_Prm_Dtl.T_Qty;

		    Exception WHen Others Then P_Price := 0;
		    End;

		    If Nvl(P_Price,0)>0 Then
		      V_Avg_Price := ((Nvl(V_Avg_Price,0)*Nvl(V_Qty,0))+Nvl(P_Price,0))/(Nvl(V_Qty,0)+1);
		    End If;
		    V_Qty := Nvl(V_Qty,0)+1;
		  End loop;

		  Begin
		      Select Max(Nvl(Ias_Qut_Prm_Dtl.T_Qty,0))
		       InTo V_Max_Qty
		      From Ias_Qut_Prm_Mst,Ias_Qut_Prm_Dtl
		     Where Ias_Qut_Prm_Mst.Quot_Ser = Ias_Qut_Prm_Dtl.Quot_Ser
		       And Ias_Qut_Prm_Mst.Quot_Ser = P_Qt_Ser
		       And Ias_Qut_Prm_Dtl.I_Code=P_Icode
		       And Ias_Qut_Prm_Dtl.Itm_Unt=P_ItmUnt;
		  Exception WHen Others Then
		     V_Max_Qty := 0;
		  End;
		  V_MQty := 0;

		  If Nvl(V_Iqty_Cmltv,0)-Nvl(V_Max_Qty,0)>Nvl(P_Iqty,0) Then
		     V_MQty := Nvl(P_Iqty,0);
		  Else
		     V_MQty := Nvl(V_Iqty_Cmltv,0)-Nvl(V_Max_Qty,0);
		  End If;

		  V_Qty := Nvl(P_Iqty,0)-Nvl(V_MQty,0);

		  If Nvl(V_Iqty_Cmltv,0)>Nvl(V_Max_Qty,0) Then
		     P_Price := ((Nvl(V_Avg_Price,0)* Nvl(V_Qty,0) )+(Nvl(P_IPrice,0)*Nvl(V_MQty,0)))/Nvl(P_Iqty,0);
		  Else
		     P_Price := Nvl(V_Avg_Price,0);
		  End If;				  	
	       End If;
	End If;
	 If (V_Qt_Qty Is Not Null And (P_Iqty> (Nvl(V_Qt_Qty,0)-Nvl(V_Qt_Qty_Bill,0)))) Or (P_Qt_Prm_Method=4 And V_By_Comp_Qty=1 And P_Fqty=0) Then
	    P_Qt_Rem_Qty := (Nvl(V_Qt_Qty,0)-Nvl(V_Qt_Qty_Bill,0)) ;
	    P_Qt_No	 := Null;
	    P_Qt_Ser	 := Null;
	    P_Qt_Icode	 := Null;
	    P_Qt_Itm_Unt := Null;
	    P_Qt_Rcrd_No := Null;
	    P_Dis_Per	 := Null;
	    P_Dis_Amt	 := Null;
	    P_Price	 := Null;
	    P_Fqty	 := Null;
	 End If;

	 Begin
	    Select Sum(Nvl(I_Qty,0)) InTo V_I_Qty_Bill From Ias_Pos_Hung_Bills Where I_Code=P_Icode And Itm_Unt=P_Itmunt And Bill_seq=P_doc_seq_tmp;
	  Exception WHen Others Then
	    V_I_Qty_Bill := 0;
	  End;
	  If NVL(V_I_Qty_Bill,0)=0 THEN
			  Begin
			    Select Sum(Nvl(I_Qty,0)) InTo V_I_Qty_Bill From Ias_pos_rt_bill_dtl_tmp Where I_Code=P_Icode And Itm_Unt=P_Itmunt And BILL_SEQ=P_doc_seq_tmp;
			  Exception WHen Others Then
			    V_I_Qty_Bill := 0;
			  End;
	  End If;
	  /*If Nvl(V_Max_Qt_Qty_Doc,0)>0 And V_I_Qty_Bill-NVL(P_Iqty,0)>=V_Max_Qt_Qty_Doc Then
		    P_Qt_No	 := Null;
		    P_Qt_Ser	 := Null;
		    P_Qt_Icode	 := Null;
		    P_Qt_Itm_Unt := Null;
		    P_Qt_Rcrd_No := Null;
		    P_Dis_Per	 := Null;
		    P_Dis_Amt	 := Null;
		    P_Price	 := Null;
		    P_Fqty	 := Null;
	  End If;*/
       End If;
       --## Get Discount For Items If Use Calculate Discount On Bills Levels
      ---------------------------------------------------------------------
       If P_Qt_Ser Is Not Null And P_Qt_Prm_Type=3 And P_Qt_Prm_Method=1 And P_Qt_Prm_Itm_Type Is Not Null Then
	     Begin
	       Select Decode(D.Disc_type,1,d.Disc_Amt_Per),
		      Decode(D.Disc_type,2,d.Disc_Amt_Per)
		   InTo P_Dis_Per,
			P_Dis_Amt
		  From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D,Ias_Itm_Mst Mi,Ias_Itm_Dtl Di
		 Where m.Quot_Ser = d.Quot_Ser
		   And Mi.I_Code  = Di.I_Code
		   And m.Quot_Ser = P_Qt_Ser
		   And Mi.I_Code  = P_Icode
		   And Di.Itm_Unt = P_ItmUnt
		   And P_IPrice Between D.F_Amt And D.T_Amt
		   And (Case When P_Qt_Prm_Itm_Type=1 And D.G_Code=Mi.G_Code Then 1
			     When P_Qt_Prm_Itm_Type=2 And D.Mng_Code=Mi.Mng_Code Then 1
			     When P_Qt_Prm_Itm_Type=3 And D.Subg_Code=Mi.Subg_Code Then 1
			     When P_Qt_Prm_Itm_Type=4 And D.Assistant_No=Mi.Assistant_No Then 1
			     When P_Qt_Prm_Itm_Type=5 And D.Detail_No=Mi.Detail_No Then 1
			     When P_Qt_Prm_Itm_Type=6 And D.Group_No=Mi.Group_No Then 1
			     When P_Qt_Prm_Itm_Type=7 And D.Item_Type=Mi.Item_Type Then 1
			     When P_Qt_Prm_Itm_Type=8 And D.Grp_Class_Code=Mi.Grp_Class_Code Then 1
			     When P_Qt_Prm_Itm_Type=9 And Exists(Select 1 From Ias_Qut_Prm_Grp_Dtl Where Prm_Grp_No=D.Prm_Grp_No And I_Code=P_Icode And RowNum<=1) Then 1
			     Else 0 End)=1
		   And Nvl(d.Batch_No,'0')= Decode(Nvl(D.Batch_No,'0'),'0',Nvl(D.Batch_No,'0'),Nvl(P_Batch_No,'0'))
		   And Nvl(d.Expire_Date,'01/01/1900')=Decode(Nvl(D.Expire_Date,'01/01/1900'),'01/01/1900',Nvl(D.Expire_Date,'01/01/1900'),Nvl(P_Exp_Date,'01/01/1900'))
		   And (Case  When M.Qt_Prm_Wc_Type=0 Then 1
			      When M.Qt_Prm_Wc_Type=1 And D.W_Code   = P_Wcode Then 1
			      When M.Qt_Prm_Wc_Type=2 And D.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			      When M.Qt_Prm_Wc_Type=3 And D.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			      When M.Qt_Prm_Wc_Type=4 And D.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			      When M.Qt_Prm_Wc_Type=5 And D.City_No  =(Select City_No  From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			      When M.Qt_Prm_Wc_Type=6 And D.R_Code   =(Select R_Code   From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
		      Else 0 End)=1
		   And (Case  When M.Qt_Prm_Cst_Type=0 Then 1
			      When M.Qt_Prm_Cst_Type=1 And D.C_Code	  = P_C_Code	   Then 1
			      When M.Qt_Prm_Cst_Type=2 And D.C_Group_Code = P_C_Group_Code Then 1
			      When M.Qt_Prm_Cst_Type=3 And D.C_Class	  = P_C_Class	   Then 1
			      When M.Qt_Prm_Cst_Type=4 And D.C_Degree	  = P_C_Degree	   Then 1
			      When M.Qt_Prm_Cst_Type=6 And D.Bank_no	  =P_Cr_Bnk_No1    Then 1
			      When M.Qt_Prm_Cst_Type=7 And D.Cust_Grp_Code = P_Cst_Grp_Csh     Then 1
			      When M.Qt_Prm_Cst_Type=8 And D.C_Code_Csh     = P_c_code_csh     Then 1
			      Else 0 End)=1
		    And Not EXISTS (
							SELECT 1
							FROM IAS_QUT_PRM_CSTMZ
							WHERE QUOT_SER= M.QUOT_SER
							GROUP BY CSTMZ_TYP
							HAVING SUM(
							       CASE
								 WHEN (CSTMZ_TYP=1 AND CSTMZ_CODE =P_BRN_NO)
								   OR (CSTMZ_TYP=2 AND CSTMZ_CODE =P_WCODE)
								   OR (CSTMZ_TYP=3 AND	CSTMZ_CODE=V_WH_G_CODE)
								   OR (CSTMZ_TYP=4 AND	CSTMZ_CODE=P_C_GROUP_CODE)
								   OR (CSTMZ_TYP=5 AND	CSTMZ_CODE=P_C_CLASS)
								   OR (CSTMZ_TYP=6 AND	CSTMZ_CODE=P_C_DEGREE)
								   OR (CSTMZ_TYP=7 AND	CSTMZ_CODE=P_CST_GRP_CSH)
								 THEN 1
								 ELSE 0
							       END
							     ) = 0 )
		    And (Case
						 When NVL(M.BY_LEV_NO,0) =0 Then 1
						 When NVL(M.BY_LEV_NO,0) =1 And D.LEV_NO = P_LEV_NO  Then 1
						 Else 0 End)=1
		   And RowNum<=1;
		EXCEPTION WHEN OTHERS THEN
		    P_Qt_No	      := Null;
		    P_Qt_Ser	      := Null;
		    P_Qt_Prm_Type     := Null;
		    P_Qt_Prm_Method   := Null;
		    P_Qt_Prm_Itm_Type := Null;
		    P_Qt_Rcrd_No      := Null;
		    P_Dis_Per	      := Null;
		    P_Dis_Amt	      := Null;
		END;
       End If;
    EXCEPTION WHEN OTHERS THEN NULL;
    END Ias_Get_Qt_Prm ;
----------------------------------------------------------------------------------------------------------------------------
    FUNCTION  Ias_Get_Qt_Prm_Type ( P_Qt_Ser In  Number) RETURN Number Is
     V_Qt_Prm_Type Number;
    Begin
      Select Qt_Prm_Type
	Into v_Qt_Prm_Type
	From ias_qut_prm_mst
       Where quot_ser = P_qt_ser
	 and RowNum<=1;

	 Return(v_Qt_Prm_Type);
     Exception When Others Then
	Return(0);
    End Ias_Get_Qt_Prm_Type;
    ----------------------------------------------------------------------------------------------------------------------------
    FUNCTION  Ias_Get_Qt_Prm_Method ( P_Qt_Ser In  Number) RETURN Number Is
     V_Qt_Prm_Method Number;
    Begin
      Select Qt_Prm_Method
	Into v_Qt_Prm_Method
	From ias_qut_prm_mst
       Where quot_ser = P_qt_ser
	 and RowNum<=1;

	 Return(v_Qt_Prm_Method);
     Exception When Others Then
	Return(0);
    End Ias_Get_Qt_Prm_Method;

    FUNCTION  Ias_Get_Qt_Prm_Fqty ( P_Qt_Ser In  Number , P_Qt_Rcrd_No In  Number,P_Icode Varchar2) RETURN Number Is
      V_Qt_Fqty Number;
    Begin
     If P_qt_ser Is Not Null And P_qt_Rcrd_No Is Not Null Then
	  Select Free_Qty
	    Into v_Qt_Fqty
	    From ias_qut_prm_dtl
	   Where quot_ser = P_qt_ser
	     and rcrd_no = P_Qt_Rcrd_No
	     and RowNum<=1;
	   If Nvl(v_Qt_Fqty,0)=0 Then
	      Select Free_Qty
	    Into v_Qt_Fqty
	    From ias_qut_prm_sub_dtl
	   Where quot_ser = P_qt_ser
	     and i_code=P_Icode
	     and rcrd_no = P_Qt_Rcrd_No
	     and RowNum<=1;
	   End If;
     End If;
	 Return(Nvl(v_Qt_Fqty,0));
     Exception When Others Then
	Return(0);
    End Ias_Get_Qt_Prm_Fqty;
--------------------------------------------------------------------------------------------------------
   FUNCTION  Chk_Qt_Prm_Disc ( P_Qt_Ser In  Number ) RETURN Number IS
    V_Use_Disc Number;
   Begin
     If P_qt_ser Is Not Null Then
	  Select Disc_Amt_Per
	    Into V_Use_Disc
	    From ias_qut_prm_dtl
	   Where quot_ser = P_qt_ser
	     and RowNum<=1;
     End If;
	 Return(V_Use_Disc);
     Exception When Others Then
	Return(0);
    End Chk_Qt_Prm_Disc;

    FUNCTION  Chk_Qt_Prm_Free_Qty ( P_Qt_Ser In  Number ) RETURN Number IS
    V_Use_Fqty Number;
   Begin
     If P_qt_ser Is Not Null Then
	  Select Free_Qty
	    Into V_Use_Fqty
	    From ias_qut_prm_dtl
	   Where quot_ser = P_qt_ser
	     and RowNum<=1;

	   If Nvl(V_Use_Fqty,0)=0 Then
	     Select Free_Qty
	    Into V_Use_Fqty
	    From ias_qut_prm_sub_dtl
	   Where quot_ser = P_qt_ser
	     and RowNum<=1;
	   End If;
     End If;
	 Return(V_Use_Fqty);
     Exception When Others Then
	Return(0);
    End Chk_Qt_Prm_Free_Qty;

PROCEDURE IAS_Calc_Quot_Prm_Prc ( P_Doc_Srl  In Ias_Pos_Bill_Mst.Bill_No%Type ,
	P_Doc_Seq Ias_Pos_Hung_Bills.Bill_Seq%Type,
	P_Date In Date ,
	P_Bill_Doc_Type IN NUMBER ,
	P_No_Of_Dcml In Number,
	P_FND_PRM OUT NUMBER,
	P_C_Code	In Varchar2,
	P_C_Group_Code	In Number,
	P_C_Class	In Number,
	P_C_Degree	In Number,
	P_C_Code_Csh	In Varchar2,
	P_Cst_Grp_Csh	In Number,
	P_Cr_Bnk_No1	In Number Default Null ) IS
       Cursor Qt_Prm Is Select Distinct M.Quot_No,
					M.Quot_Ser,
					M.Qt_Prm_Type,
					M.Qt_Prm_Method,
					M.Qt_Prm_Wc_Type,
					D.Rcrd_No,
					D.Free_Qty,
					D.Comp_Qty,
					--Bd.I_Code,
					Decode(M.Qt_Prm_Method,1,I.G_Code,
							       2,I.Mng_Code,
							       3,I.Subg_Code,
							       4,I.Assistant_No,
							       5,I.Detail_No,
							       6,I.Group_No,
							       7,I.Item_Type,
							       8,I.Grp_Class_Code,
							       9,D.Prm_Grp_No) Itm_Code,
					Decode(M.Qt_Prm_Wc_Type,1,D.W_Code,
								2,D.Whg_Code ,
								3,D.Cntry_No,
								4,D.Prov_No,
								5,D.City_No,
								6,D.R_Code) W_Code,
					Sum(Bd.I_Qty) I_Qty,
					Trunc(Sum(Bd.I_Qty)/D.Comp_Qty)*D.Free_Qty Qt_Iqty,
					Round(Mod((Sum(Bd.I_Qty)/D.Comp_Qty)*D.Free_Qty,1)*D.Comp_Qty,1)  Qt_Iqty_not
				   From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D,Ias_Pos_Hung_Bills BD,Ias_Itm_Mst I
				  Where M.Quot_Ser = D.Quot_Ser
				    And M.Qt_Prm_Type In (4,5)
				    And Bd.I_Code =I.I_Code
				    And Bd.Bill_No= P_Doc_Srl
				    And Bd.Bill_Seq = P_Doc_Seq
				    And (Case When M.Qt_Prm_Method=1 And D.G_Code=I.G_Code Then 1
					      When M.Qt_Prm_Method=2 And D.Mng_Code=I.Mng_Code Then 1
					      When M.Qt_Prm_Method=3 And D.Subg_Code=I.Subg_Code Then 1
					      When M.Qt_Prm_Method=4 And D.Assistant_No=I.Assistant_No Then 1
					      When M.Qt_Prm_Method=5 And D.Detail_No=I.Detail_No Then 1
					      When M.Qt_Prm_Method=6 And D.Group_No=I.Group_No Then 1
					      When M.Qt_Prm_Method=7 And D.Item_Type=I.Item_Type Then 1
					      When M.Qt_Prm_Method=8 And D.Grp_Class_Code=I.Grp_Class_Code Then 1
					      When M.Qt_Prm_Method=9 And Exists(Select 1 From Ias_Qut_Prm_Grp_Dtl Where Prm_Grp_No=D.Prm_Grp_No And I_Code=BD.I_Code And RowNum<=1) Then 1
					      Else 0 End)=1
				    And (Case When M.Qt_Prm_Wc_Type=0 Then 1
					      When M.Qt_Prm_Wc_Type=1 And D.W_Code   = BD.W_Code Then 1
					      When M.Qt_Prm_Wc_Type=2 And D.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=3 And D.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=4 And D.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=5 And D.City_No  =(Select City_No  From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=6 And D.R_Code   =(Select R_Code   From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      Else 0 End)=1
				    And (Case
					  When M.Qt_Prm_Cst_Type=0 Then 1
					  When M.Qt_Prm_Cst_Type=1 And D.C_Code       = P_C_Code       Then 1
					  When M.Qt_Prm_Cst_Type=2 And D.C_Group_Code = P_C_Group_Code Then 1
					  When M.Qt_Prm_Cst_Type=3 And D.C_Class      = P_C_Class      Then 1
					  When M.Qt_Prm_Cst_Type=4 And D.C_Degree     = P_C_Degree     Then 1
					  When M.Qt_Prm_Cst_Type=5 And P_c_code_csh Is Not Null Then 1
					  When M.Qt_Prm_Cst_Type=6 And D.Bank_no =P_Cr_Bnk_No1	 Then 1
					  When M.Qt_Prm_Cst_Type=7 And D.Cust_Grp_Code= P_Cst_Grp_Csh  Then 1
					  When M.Qt_Prm_Cst_Type=8 And D.C_Code_Csh   = P_c_code_csh   Then 1
					  Else 0 End)=1
				     And (Case
														 When NVL(M.BY_LEV_NO,0) =0 Then 1
														 When NVL(M.BY_LEV_NO,0) =1 And D.LEV_NO =BD.PRICE_LVL	Then 1
														 Else 0 End)=1
				    And Nvl(M.Inactive,0)=0
				    And Nvl(M.APPROVED,0)= 1
				    And Decode(P_Bill_Doc_Type,4,2,1) = Decode(M.Bill_Doc_Type,Null,Decode(P_Bill_Doc_Type,4,2,1),M.Bill_Doc_Type)
				    And P_date Between M.F_Date And M.T_Date
				    And To_Char(To_Date(P_date),'D') In (M.Fld_Day1,M.Fld_Day2,M.Fld_Day3,M.Fld_Day4,M.Fld_Day5,M.Fld_Day6,M.Fld_Day7)
				    And To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') Between Nvl(M.F_Time,To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS')) And Nvl(M.T_Time,To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS'))
				    And Nvl(M.Use_qtn_prm_in_pos_sys_flg,0)=1
				    Group By M.Quot_No,
					     M.Quot_Ser,
					     M.Qt_Prm_Type,
					     M.Qt_Prm_Method,
					     M.Qt_Prm_Wc_Type,
					     D.Rcrd_No,
					     D.Free_Qty,
					     D.Comp_Qty,
					     Decode(M.Qt_Prm_Method,1,I.G_Code,
							       2,I.Mng_Code,
							       3,I.Subg_Code,
							       4,I.Assistant_No,
							       5,I.Detail_No,
							       6,I.Group_No,
							       7,I.Item_Type,
							       8,I.Grp_Class_Code,
							       9,D.Prm_Grp_No),
					    Decode(M.Qt_Prm_Wc_Type,1,D.W_Code,
								    2,D.Whg_Code ,
								    3,D.Cntry_No,
								    4,D.Prov_No,
								    5,D.City_No,
								    6,D.R_Code)
				    Having Sum(Bd.I_Qty)>= Nvl(D.Comp_Qty,0);

BEGIN
-----------------------------------------------------------------------------------------------------------------------------------
   Begin
      Update Ias_Pos_Hung_Bills Set  Dis_Amt_Dtl    = 0,
				      Dis_per	     = 0,	      		   		
				      Qt_Prm_No      = Null,
				      Qt_Prm_Ser     = Null,
				      Qt_Prm_Rcrd_No = Null,
				      Chng_Flg=1
	  Where Bill_no  = P_Doc_Srl
	   And	Bill_Seq = P_Doc_Seq
	   And	Qt_Prm_Ser Is Not Null
	   And Exists(Select 1 From Ias_Qut_Prm_Mst Where Quot_Ser=Ias_Pos_Hung_Bills.Qt_Prm_Ser And Qt_Prm_Type In (4,5) And RowNum<=1);
   Exception When Others Then
     Null;
   End;
-----------------------------------------------------------------------------------------------------------------------------------
  For I In Qt_Prm Loop
    Declare
      Cursor C_Bill Is Select D.I_Code,D.I_Qty,D.I_Price,D.i_price_vat,D.Rcrd_No From Ias_Pos_Hung_Bills D,Ias_Itm_Mst M ,Ias_Qut_Prm_Dtl Q,Ias_Qut_Prm_Mst QM
			Where D.Bill_No  = P_Doc_Srl
			  And D.Bill_Seq = P_Doc_Seq
			  And D.I_Code	 = M.I_Code
			  And Q.Quot_Ser = I.Quot_Ser
			  And Q.Rcrd_No =  I.Rcrd_No
			  And QM.Quot_Ser = Q.Quot_Ser
			  And Decode(I.Qt_Prm_Method,1,M.G_Code,
						     2,M.Mng_Code,
						     3,M.Subg_Code,
						     4,M.Assistant_No,
						     5,M.Detail_No,
						     6,M.Group_No,
						     7,M.Item_Type,
						     8,M.Grp_Class_Code,
						     9,Q.Prm_Grp_No)=I.Itm_Code
			  And (Case When I.Qt_Prm_Method=1 And Q.G_Code=M.G_Code Then 1
				    When I.Qt_Prm_Method=2 And Q.Mng_Code=M.Mng_Code Then 1
				    When I.Qt_Prm_Method=3 And Q.Subg_Code=M.Subg_Code Then 1
				    When I.Qt_Prm_Method=4 And Q.Assistant_No=M.Assistant_No Then 1
				    When I.Qt_Prm_Method=5 And Q.Detail_No=M.Detail_No Then 1
				    When I.Qt_Prm_Method=6 And Q.Group_No=M.Group_No Then 1
				    When I.Qt_Prm_Method=7 And Q.Item_Type=M.Item_Type Then 1
				    When I.Qt_Prm_Method=8 And Q.Grp_Class_Code=M.Grp_Class_Code Then 1
				    When I.Qt_Prm_Method=9 And Exists(Select 1 From Ias_Qut_Prm_Grp_Dtl Where Prm_Grp_No=Q.Prm_Grp_No And I_Code=D.I_Code And RowNum<=1) Then 1
				    Else 0 End)=1
			  And (Case
									 When NVL(QM.BY_LEV_NO,0) =0 Then 1
									 When NVL(QM.BY_LEV_NO,0) =1 And Q.LEV_NO =D.PRICE_LVL	Then 1
									 Else 0 End)=1
			  And Decode(I.Qt_Prm_Wc_Type,1,Q.W_Code,
						      2,Q.Whg_Code ,
						      3,Q.Cntry_No,
						      4,Q.Prov_No,
						      5,Q.City_No,
						      6,Q.R_Code,0)=Nvl(I.W_Code,0)
			  Order By  Decode(I.Qt_Prm_Type,4,I_Price,I_Price*-1) Asc;
      V_Qt_Iqty  Number:=0;
      V_i_price  Number:=0;
    Begin
      V_Qt_Iqty := I.Qt_Iqty;

      For J In C_Bill Loop
	If j.i_price_vat>j.i_price then
	  v_i_price:=j.i_price_vat;
	Else
	  v_i_price:=j.i_price;
	End If;

	If J.I_Qty>V_Qt_Iqty Then
	P_FND_PRM:=1;

	   Update Ias_Pos_Hung_Bills Set  Dis_Amt_Dtl	 = (Nvl(v_i_price,0)/J.I_Qty)*Nvl(V_Qt_Iqty,0),
					  Dis_per	 =(nvl((Nvl(J.I_Price,0)/J.I_Qty)*Nvl(V_Qt_Iqty,0),0)/nvl(i_price,0))*100,	      		   		
					  Qt_Prm_No	 = I.Quot_No,
					  Qt_Prm_Ser	 = I.Quot_Ser,
					  Qt_Prm_Rcrd_No = I.Rcrd_No,
					  Chng_Flg	 = 1
	  Where Bill_no     = P_Doc_Srl
	    And Bill_Seq    = P_Doc_Seq
	    And I_Code	    = J.I_Code
	    And Rcrd_No     = J.Rcrd_No;
	   V_Qt_Iqty := 0;
	   P_FND_PRM :=1;
	Else


	 Update Ias_Pos_Hung_Bills Set Dis_Amt_Dtl    = Nvl(v_i_price,0),
				       Dis_Per	      = 100,
				       Qt_Prm_No      = I.Quot_No,
				       Qt_Prm_Ser     = I.Quot_Ser,
				       Qt_Prm_Rcrd_No = I.Rcrd_No,
				       Chng_Flg       = 1
	    Where Bill_No     = P_Doc_Srl
	      And Bill_Seq    = P_Doc_Seq
	      And I_Code      = J.I_Code
	      And Rcrd_No     = J.Rcrd_No;
	      V_Qt_Iqty := V_Qt_Iqty - J.I_Qty;

	End If;
       /* IF V_Qt_Iqty=0 THEN
		   Begin

		    Update Ias_Pos_Hung_Bills Set
						     Qt_Prm_No	    = I.Quot_No,
						     Qt_Prm_Ser     = I.Quot_Ser,
						     Qt_Prm_Rcrd_No = I.Rcrd_No,
						     Chng_Flg	    = 1
			  Where Bill_no    = P_Doc_Srl
			   And	Bill_Seq   = P_Doc_Seq
			   And	Qt_Prm_Ser Is  Null
			   And	Nvl(Dis_Amt_Dtl,0)=0
			   and	Rcrd_No in(  --5
				select Rcrd_No from (--4
				select rwn,Rcrd_No,I_Code,I_Price from (
				select rownum rwn ,I_Code,I_Qty,I_Price,Rcrd_No
				from(
				Select D.I_Code,D.I_Qty,D.I_Price,D.Rcrd_No From Ias_Pos_Hung_Bills D,Ias_Itm_Mst M ,Ias_Qut_Prm_Dtl Q
							Where D.Bill_No = P_Doc_Srl
							  And D.I_Code	 = M.I_Code
							  And Q.Quot_Ser = I.Quot_Ser
							  And Q.Rcrd_No  = I.Rcrd_No
							  And Decode(I.Qt_Prm_Method,1,M.G_Code,
									     2,M.Mng_Code,
									     3,M.Subg_Code,
									     4,M.Assistant_No,
									     5,M.Detail_No,
									     6,M.Group_No,
									     7,M.Item_Type,
									     8,M.Grp_Class_Code,
									     9,Q.Prm_Grp_No)=I.Itm_Code
							  And Decode(I.Qt_Prm_Wc_Type,1,Q.W_Code,
									      2,Q.Whg_Code ,
									      3,Q.Cntry_No,
									      4,Q.Prov_No,
									      5,Q.City_No,
									      6,Q.R_Code,0)=Nvl(I.W_Code,0)
							  Order By  Decode(I.Qt_Prm_Type,5,I_Price,I_Price*-1) Asc  --1  REVERSE THE Qt_Prm_Type
							  )--2
							  )--3
							  where rwn>Nvl(Round(I.Qt_Iqty_not,1),0)
							  ) --4
							  )-- end update
							  ;

		   Exception When Others Then
		     Null;
		   End;
	  EXIT;
	End If; */
      End Loop;
    ENd;
  End Loop;

 Exception When Others then
 Null;
END IAS_Calc_Quot_Prm_Prc;

PROCEDURE IAS_Calc_Rt_Quot_Prm_Prc ( P_Doc_Srl	In Ias_Pos_Rt_Bill_Mst.Rt_Bill_No%Type ,P_Bill_NO In Ias_Pos_Rt_Bill_Mst.Bill_No%Type,P_Date In Date , P_Bill_Doc_Type IN NUMBER , P_No_Of_Dcml In Number,P_Disc_Amt_Bill_Prm In Number,P_FND_PRM OUT NUMBER) IS
       Cursor Qt_Prm Is Select Distinct M.Quot_No,
					M.Quot_Ser,
					M.Qt_Prm_Type,
					M.Qt_Prm_Method,
					M.Qt_Prm_Wc_Type,
					D.Rcrd_No,
					D.Free_Qty,
					D.Comp_Qty,
					Decode(M.Qt_Prm_Method,1,I.G_Code,
							       2,I.Mng_Code,
							       3,I.Subg_Code,
							       4,I.Assistant_No,
							       5,I.Detail_No,
							       6,I.Group_No,
							       7,I.Item_Type,
							       8,I.Grp_Class_Code,
							       9,D.Prm_Grp_No) Itm_Code,
					Decode(M.Qt_Prm_Wc_Type,1,D.W_Code,
								2,D.Whg_Code ,
								3,D.Cntry_No,
								4,D.Prov_No,
								5,D.City_No,
								6,D.R_Code) W_Code,
					Sum(Bd.I_Qty) I_Qty,
					Round(Mod((Sum(Bd.I_Qty)/D.Comp_Qty)*D.Free_Qty,1)*D.Comp_Qty,1)  Qt_Iqty_not,
					Trunc(Sum(Bd.I_Qty)/D.Comp_Qty)*D.Free_Qty Qt_Iqty
				   From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D,Ias_Pos_Rt_Bill_Dtl_Tmp BD,Ias_Itm_Mst I
				  Where M.Quot_Ser = D.Quot_Ser
				    And M.Qt_Prm_Type In (4,5)
				    And Bd.I_Code =I.I_Code
				    And Bd.Rt_Bill_No= P_Doc_Srl
				    And Nvl(M.Use_qtn_prm_in_pos_sys_flg,0)=1
				    and Exists (select 1 from Ias_Pos_Bill_Dtl	Bill
						    Where Bill.I_Code=BD.I_Code
						    And Bill.Bill_No = BD.BILL_NO
						    And Bill.Bill_No = P_Bill_No
						    And Bill.Qt_Prm_Ser =M.Quot_Ser
						      Union all
						    select 1 from Ias_Pos_Hst_Bill_Dtl	Bill
						    Where Bill.I_Code=BD.I_Code
						    And Bill.Bill_No = BD.BILL_NO
						    And Bill.Bill_No = P_Bill_No
						    And Bill.Qt_Prm_Ser =M.Quot_Ser  )
				    And (Case When M.Qt_Prm_Method=1 And D.G_Code=I.G_Code Then 1
					      When M.Qt_Prm_Method=2 And D.Mng_Code=I.Mng_Code Then 1
					      When M.Qt_Prm_Method=3 And D.Subg_Code=I.Subg_Code Then 1
					      When M.Qt_Prm_Method=4 And D.Assistant_No=I.Assistant_No Then 1
					      When M.Qt_Prm_Method=5 And D.Detail_No=I.Detail_No Then 1
					      When M.Qt_Prm_Method=6 And D.Group_No=I.Group_No Then 1
					      When M.Qt_Prm_Method=7 And D.Item_Type=I.Item_Type Then 1
					      When M.Qt_Prm_Method=8 And D.Grp_Class_Code=I.Grp_Class_Code Then 1
					      When M.Qt_Prm_Method=9 And Exists(Select 1 From Ias_Qut_Prm_Grp_Dtl Where Prm_Grp_No=D.Prm_Grp_No And I_Code=BD.I_Code And RowNum<=1) Then 1
					      Else 0 End)=1
				    And (Case When M.Qt_Prm_Wc_Type=0 Then 1
					      When M.Qt_Prm_Wc_Type=1 And D.W_Code   = BD.W_Code Then 1
					      When M.Qt_Prm_Wc_Type=2 And D.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=3 And D.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=4 And D.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=5 And D.City_No  =(Select City_No  From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=6 And D.R_Code   =(Select R_Code   From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      Else 0 End)=1
				    Group By M.Quot_No,
					     M.Quot_Ser,
					     M.Qt_Prm_Type,
					     M.Qt_Prm_Method,
					     M.Qt_Prm_Wc_Type,
					     D.Rcrd_No,
					     D.Free_Qty,
					     D.Comp_Qty,
					     Decode(M.Qt_Prm_Method,1,I.G_Code,
							       2,I.Mng_Code,
							       3,I.Subg_Code,
							       4,I.Assistant_No,
							       5,I.Detail_No,
							       6,I.Group_No,
							       7,I.Item_Type,
							       8,I.Grp_Class_Code,
							       9,D.Prm_Grp_No),
					    Decode(M.Qt_Prm_Wc_Type,1,D.W_Code,
								    2,D.Whg_Code ,
								    3,D.Cntry_No,
								    4,D.Prov_No,
								    5,D.City_No,
								    6,D.R_Code)
					    Having Sum(Bd.I_Qty)>= Nvl(D.Comp_Qty,0);

BEGIN
-----------------------------------------------------------------------------------------------------------------------------------
   Begin
      Update Ias_Pos_Rt_Bill_Dtl_Tmp Set  Dis_Amt_Dtl	 = 0,
					  Dis_Amt_Dtl_Vat = 0,
					  Dis_per	 = 0,	      		   		
					  Qt_Prm_No	 = Null,
					  Qt_Prm_Ser	 = Null,
					  Qt_Prm_Rcrd_No = Null,
					  Chng_Flg=1
	      Where Rt_Bill_no	  = P_Doc_Srl
	   And	Qt_Prm_Ser Is Not Null
	   And Exists(Select 1 From Ias_Qut_Prm_Mst Where Quot_Ser=Ias_Pos_Rt_Bill_Dtl_Tmp.Qt_Prm_Ser And Qt_Prm_Type In (4,5) And RowNum<=1);
   Exception When Others Then
     Null;
   End;
-----------------------------------------------------------------------------------------------------------------------------------
  For I In Qt_Prm Loop

    Declare
      Cursor C_Bill Is Select D.I_Code,D.ITM_UNT,D.I_Qty,D.I_Price,D.I_Price_Vat,D.Rcrd_No From Ias_Pos_Rt_Bill_Dtl_Tmp D,Ias_Itm_Mst M ,Ias_Qut_Prm_Dtl Q
			Where D.Rt_Bill_No = P_Doc_Srl
			  And D.I_Code	   = M.I_Code
			  And Q.Quot_Ser   = I.Quot_Ser
			  And Q.Rcrd_No    = I.Rcrd_No
			  --And D.I_Code     = B.I_Code
			  And D.Bill_No    = P_Bill_NO
			  and Exists (select 1 from Ias_Pos_Bill_Dtl  Bill
			    Where Bill.I_Code=D.I_Code
			    And Bill.Itm_Unt = D.Itm_Unt
			    And Bill.Bill_No = D.BILL_NO
			    And Bill.Bill_No = P_Bill_No
			    And Bill.Qt_Prm_Ser =I.Quot_Ser
			    Union all
				    select 1 from Ias_Pos_Hst_Bill_Dtl	Bill
				    Where Bill.I_Code=D.I_Code
				    And Bill.Itm_Unt = D.Itm_Unt
				    And Bill.Bill_No = D.BILL_NO
				    And Bill.Bill_No = P_Bill_No
				    And Bill.Qt_Prm_Ser =I.Quot_Ser   )
			  And Decode(I.Qt_Prm_Method,1,M.G_Code,
						     2,M.Mng_Code,
						     3,M.Subg_Code,
						     4,M.Assistant_No,
						     5,M.Detail_No,
						     6,M.Group_No,
						     7,M.Item_Type,
						     8,M.Grp_Class_Code,
						     9,Q.Prm_Grp_No)=I.Itm_Code
			  And Decode(I.Qt_Prm_Wc_Type,1,Q.W_Code,
						      2,Q.Whg_Code ,
						      3,Q.Cntry_No,
						      4,Q.Prov_No,
						      5,Q.City_No,
						      6,Q.R_Code,0)=Nvl(I.W_Code,0)
			  Order By  Decode(I.Qt_Prm_Type,4,I_Price,I_Price*-1) Asc;
      V_Qt_Iqty 	  Number:=0;
      V_Net_Price	  Number:=0;
      V_Disc_Amt_Bill_Prm Number:=0;
    Begin

       V_Qt_Iqty := I.Qt_Iqty;

      For J In C_Bill Loop

	If J.I_Qty>V_Qt_Iqty Then
	    P_FND_PRM:=1;

	   Update Ias_Pos_Rt_Bill_Dtl_Tmp Set Dis_Amt_Dtl    = (Nvl(J.I_Price,0)/J.I_Qty)*Nvl(V_Qt_Iqty,0),
					      Dis_Amt_Dtl_Vat= (Nvl(J.I_Price_Vat,0)/J.I_Qty)*Nvl(V_Qt_Iqty,0),
					      Dis_per	     =(nvl((Nvl(J.I_Price,0)/J.I_Qty)*Nvl(V_Qt_Iqty,0),0)/nvl(i_price,0))*100,	      		   		
					      Qt_Prm_No      = I.Quot_No,
					      Qt_Prm_Ser     = I.Quot_Ser,
					      Qt_Prm_Rcrd_No = I.Rcrd_No,
					      Chng_Flg	     = 1
	  Where Rt_Bill_No  = P_Doc_Srl
	    And I_Code	    = J.I_Code
	    And Rcrd_No     = J.Rcrd_No;
	   V_Qt_Iqty := 0;
	   P_FND_PRM :=1;
	Else

	 Update Ias_Pos_Rt_Bill_Dtl_Tmp Set Dis_Amt_Dtl    = Nvl(J.I_Price,0),
					    Dis_Amt_Dtl_Vat= Nvl(J.I_Price_Vat,0),
					    Dis_Per	   = 100,
					    Qt_Prm_No	   = I.Quot_No,
					    Qt_Prm_Ser	   = I.Quot_Ser,
					    Qt_Prm_Rcrd_No = I.Rcrd_No,
					    Chng_Flg	   = 1
	    Where Rt_Bill_No  = P_Doc_Srl
	      And I_Code      = J.I_Code
	      And Rcrd_No     = J.Rcrd_No;
	      V_Qt_Iqty := V_Qt_Iqty - J.I_Qty;

	End If;
	IF V_Qt_Iqty=0 THEN
		   Begin
		    Update Ias_Pos_Rt_Bill_Dtl_Tmp Set
						     Qt_Prm_No	    = I.Quot_No,
						     Qt_Prm_Ser     = I.Quot_Ser,
						     Qt_Prm_Rcrd_No = I.Rcrd_No,
						     Chng_Flg	    = 1
			  Where Rt_Bill_No    = P_Doc_Srl
			   And	Qt_Prm_Ser Is  Null
			   and	Rcrd_No in(  --5
				select Rcrd_No from (--4
				select rwn,Rcrd_No,I_Code,I_Price from (
				select rownum rwn ,I_Code,I_Qty,I_Price,Rcrd_No
				from(
				Select D.I_Code,D.I_Qty,D.I_Price,D.I_Price_Vat,D.Rcrd_No From Ias_Pos_Rt_Bill_Dtl_Tmp D,Ias_Itm_Mst M ,Ias_Qut_Prm_Dtl Q
							Where D.Rt_Bill_No = P_Doc_Srl
							  And D.I_Code	 = M.I_Code
							  And Q.Quot_Ser = I.Quot_Ser
							  And Q.Rcrd_No  = I.Rcrd_No
							  and Exists (select 1 from Ias_Pos_Bill_Dtl  Bill
									Where Bill.I_Code=D.I_Code
									And Bill.Itm_Unt = D.Itm_Unt
									And Bill.Bill_No = P_Bill_No
									And Bill.Bill_No = D.BILL_NO
									And Bill.Qt_Prm_Ser =I.Quot_Ser
									Union All
									select 1 from Ias_Pos_Hst_Bill_Dtl  Bill
									Where Bill.I_Code=D.I_Code
									And Bill.Itm_Unt = D.Itm_Unt
									And Bill.Bill_No = P_Bill_No
									And Bill.Bill_No = D.BILL_NO
									And Bill.Qt_Prm_Ser =I.Quot_Ser )
							  And Decode(I.Qt_Prm_Method,1,M.G_Code,
									     2,M.Mng_Code,
									     3,M.Subg_Code,
									     4,M.Assistant_No,
									     5,M.Detail_No,
									     6,M.Group_No,
									     7,M.Item_Type,
									     8,M.Grp_Class_Code,
									     9,Q.Prm_Grp_No)=I.Itm_Code
							  And Decode(I.Qt_Prm_Wc_Type,1,Q.W_Code,
									      2,Q.Whg_Code ,
									      3,Q.Cntry_No,
									      4,Q.Prov_No,
									      5,Q.City_No,
									      6,Q.R_Code,0)=Nvl(I.W_Code,0)
							  Order By  Decode(I.Qt_Prm_Type,5,I_Price,I_Price*-1) Asc  --1  REVERSE THE Qt_Prm_Type
							  )--2
							  )--3
							  where rwn>Nvl(Round(I.Qt_Iqty_not,1),0)
							  ) --4
							  );-- end update

		   Exception When Others Then
		     Null;
		   End;
	   EXIT;
	END IF;
      End Loop;
    ENd;
  End Loop;
 Exception When Others then
 Null;
END IAS_Calc_Rt_Quot_Prm_Prc;

FUNCTION  GET_BILL_PRICE_FOR_RPLC_PRM (P_Bill_no  In Ias_Pos_Bill_Mst.Bill_No%Type ,P_Doc_Seq Ias_Pos_Hung_Bills.Bill_Seq%Type , P_Qt_Ser In  Number) RETURN Number Is
     V_Qt_Prm_Method number;
     V_Qt_Prm_Wc_Type Number;
     V_Amt   Number;
Begin

	 Begin
      Select Qt_Prm_Method,
	     Qt_Prm_Wc_Type
	Into V_Qt_Prm_Method,
	     V_Qt_Prm_Wc_Type
	From ias_qut_prm_mst
       Where Quot_Ser = P_Qt_Ser
	 and RowNum<=1;
	 Exception When Others Then
	 	V_Qt_Prm_Wc_Type:=0;
	 End;

      Begin
       Select Sum((Nvl(BD.I_Price,0)+Nvl(BD.Vat_Amt,0))*Nvl(BD.I_Qty,0) )  Into V_Amt
	   From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D,Ias_Pos_Hung_Bills BD,Ias_Itm_Mst I
				      Where M.Quot_Ser = D.Quot_Ser
					And M.Quot_Ser =P_Qt_Ser
					And BD.Qt_Prm_Ser Is Null
					And M.Qt_Prm_Type In (4,5)
					And Bd.I_Code =I.I_Code
					And Bd.Bill_No= P_Bill_no
					And Bd.Bill_Seq = P_Doc_Seq
					And (Case When M.Qt_Prm_Method=1 And D.G_Code=I.G_Code Then 1
						  When M.Qt_Prm_Method=2 And D.Mng_Code=I.Mng_Code Then 1
						  When M.Qt_Prm_Method=3 And D.Subg_Code=I.Subg_Code Then 1
						  When M.Qt_Prm_Method=4 And D.Assistant_No=I.Assistant_No Then 1
						  When M.Qt_Prm_Method=5 And D.Detail_No=I.Detail_No Then 1
						  When M.Qt_Prm_Method=6 And D.Group_No=I.Group_No Then 1
						  When M.Qt_Prm_Method=7 And D.Item_Type=I.Item_Type Then 1
						  When M.Qt_Prm_Method=8 And D.Grp_Class_Code=I.Grp_Class_Code Then 1
						  When M.Qt_Prm_Method=9 And Exists(Select 1 From Ias_Qut_Prm_Grp_Dtl Where Prm_Grp_No=D.Prm_Grp_No And I_Code=BD.I_Code And RowNum<=1) Then 1
						  Else 0 End)=1
					And (Case When M.Qt_Prm_Wc_Type=0 Then 1
						  When M.Qt_Prm_Wc_Type=1 And D.W_Code	 = BD.W_Code Then 1
						  When M.Qt_Prm_Wc_Type=2 And D.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
						  When M.Qt_Prm_Wc_Type=3 And D.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
						  When M.Qt_Prm_Wc_Type=4 And D.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
						  When M.Qt_Prm_Wc_Type=5 And D.City_No  =(Select City_No  From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
						  When M.Qt_Prm_Wc_Type=6 And D.R_Code	 =(Select R_Code   From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
						  Else 0 End)=1
					Group By M.Quot_No,
						 M.Quot_Ser,
						 M.Qt_Prm_Type,
						 M.Qt_Prm_Method,
						 M.Qt_Prm_Wc_Type,
						 D.Rcrd_No,
						 D.Free_Qty,
						 D.Comp_Qty,
						 Decode(M.Qt_Prm_Method,1,I.G_Code,
								   2,I.Mng_Code,
								   3,I.Subg_Code,
								   4,I.Assistant_No,
								   5,I.Detail_No,
								   6,I.Group_No,
								   7,I.Item_Type,
								   8,I.Grp_Class_Code,
								   9,D.Prm_Grp_No),
						Decode(M.Qt_Prm_Wc_Type,1,D.W_Code,
									2,D.Whg_Code ,
									3,D.Cntry_No,
									4,D.Prov_No,
									5,D.City_No,
									6,D.R_Code);
      Exception When Others Then
	    null;
      End;
     Return(V_Amt);
  Exception When Others Then
	Return(0);
  End GET_BILL_PRICE_FOR_RPLC_PRM;
--##-----------------------------------------------------------------------------------------------------##--
 PROCEDURE IAS_Clc_Qtn_Prm_Grp_Prc (P_Bill_No	    In Ias_Pos_Bill_Mst.Bill_No%Type ,
				    P_Bill_Seq	    In Ias_Pos_Hung_Bills.Bill_Seq%Type,
				    P_Date	    In Date ,
				    P_Bill_Doc_Type In Number ,
				    P_C_Code	    In	Varchar2,
				    P_C_Group_Code  In	Number,
				    P_C_Class	    In	Number,
				    P_C_Degree	    In	Number,
				    P_C_Code_Csh    In	Varchar2,
				    P_Cst_Grp_Csh   In	Number,
				    P_Cr_Bnk_No1    In	Number Default Null,
				    P_Bill_Rate     In	Number,
				    P_Chk_Qt_Ser    In	Number Default Null,
				    P_No_Of_Dcml    In	Number
				    ) IS
       Cursor Qt_Prm Is Select Distinct M.Quot_No,
					M.Quot_Ser,
					M.Qt_Prm_Type,
					M.Qt_Prm_Method,
					M.Qt_Prm_Wc_Type,
					M.Qt_Prm_Cst_Type,
					M.Calc_All_Slides,
					D.Qt_I_Code,
					D.Qt_Itm_Unt,
					D.Rcrd_No,
					D.Free_Qty,
					D.Comp_Qty,
					D.Qt_PRM_GRP_NO,
					GD.Prm_Grp_No,
					GM.Grnt_Free_Qty_Typ,
					M.By_Comp_Qty,
					NVL(Gm.Chk_All_Itms,0) Chk_All_Itms,
					Decode(M.Qt_Prm_Type,1,0,D.F_Qty) F_Qty,
					Decode(M.Qt_Prm_Type,1,0,D.T_Qty) T_Qty,
					Decode(M.Qt_Prm_Wc_Type,1,D.W_Code,
								2,D.Whg_Code ,
								3,D.Cntry_No,
								4,D.Prov_No,
								5,D.City_No,
								6,D.R_Code) W_Code,
					Decode(M.BY_LEV_NO,1,D.LEV_NO, NULL)  PRICE_LVL,
					--Decode(M.BY_LEV_NO,1,D.LEV_NO, NULL)LEV_NO,
					Trunc(Sum((Nvl(Bd.I_Qty,0)*Nvl(Bd.P_Size,0))/Nvl(GD.P_Size,0))) I_Qty,
					Trunc(Sum(((Nvl(Bd.I_Qty,0)*Nvl(Bd.P_Size,0))/Nvl(GD.P_Size,0)))/D.Comp_Qty) Qt_Qty,
					(Case When M.Qt_Prm_Method=Decode(M.Qt_Prm_Type,1,6) And D.Disc_type=1 Then D.Disc_Amt_Per Else Null End) Dis_Per,
					(Case When M.Qt_Prm_Method=Decode(M.Qt_Prm_Type,1,6) And D.Disc_type=2 Then
							    Nvl(round(D.Disc_Amt_Per * Ias_Gen_Pkg.Get_Cur_rate(M.Quot_cur)/P_Bill_Rate,P_No_Of_Dcml),0) Else Null End) Dis_Amt,
					(Case When M.Qt_Prm_Method=Decode(M.Qt_Prm_Type,2,11)  Then D.I_PRICE Else Null End) PRM_GRP_I_PRICE
				   From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D,Ias_Pos_Hung_Bills BD,Ias_Qut_Prm_Grp_Mst GM,Ias_Qut_Prm_Grp_Dtl GD
				  Where M.Quot_Ser	= D.Quot_Ser
				    And Bd.Bill_Seq	=P_Bill_Seq
				    And Bd.Bill_No	=P_Bill_No
				    And Gm.Prm_Grp_No	= Gd.Prm_Grp_No
				    And M.Quot_Ser = Nvl(P_Chk_Qt_Ser,M.Quot_Ser)
				    And M.Qt_Prm_Type	In (1,2)
				    And M.Qt_Prm_Method In (6,7,10,11)
				    And Bd.I_Code	= GD.I_Code
				    And Bd.Itm_Unt	= GD.Itm_Unt
				    And D.Prm_Grp_No	= GD.Prm_Grp_No
				    And (Case When M.Qt_Prm_Cst_Type=0 Then 1
					      When M.Qt_Prm_Cst_Type=1 And D.C_Code	  = P_C_Code	   Then 1
					      When M.Qt_Prm_Cst_Type=2 And D.C_Group_Code = P_C_Group_Code Then 1
					      When M.Qt_Prm_Cst_Type=3 And D.C_Class	  = P_C_Class	   Then 1
					      When M.Qt_Prm_Cst_Type=4 And D.C_Degree	  = P_C_Degree	   Then 1
					      When M.Qt_Prm_Cst_Type=5	And P_c_code_csh Is Not Null Then 1
					      When M.Qt_Prm_Cst_Type=7 And D.Cust_Grp_Code= P_Cst_Grp_Csh     Then 1
					      When M.Qt_Prm_Cst_Type=8 And D.C_Code_Csh   = Nvl(P_c_code_csh,'0')     Then 1
					      Else 0 End)=1
				    And (Case When M.Qt_Prm_Wc_Type=0 Then 1
					      When M.Qt_Prm_Wc_Type=1 And D.W_Code   = BD.W_Code Then 1
					      When M.Qt_Prm_Wc_Type=2 And D.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=3 And D.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=4 And D.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=5 And D.City_No  =(Select City_No  From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=6 And D.R_Code   =(Select R_Code   From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      Else 0 End)=1
				    And Not EXISTS (
														SELECT 1
														FROM IAS_QUT_PRM_CSTMZ
														WHERE QUOT_SER= M.QUOT_SER
														GROUP BY CSTMZ_TYP
														HAVING SUM(
														       CASE
															 WHEN (CSTMZ_TYP=1 AND CSTMZ_CODE =BD.BRN_NO)
															   OR (CSTMZ_TYP=2 AND CSTMZ_CODE =BD.W_Code)
															   --OR (CSTMZ_TYP=3 AND  CSTMZ_CODE=V_WH_G_CODE)
															   OR (CSTMZ_TYP=4 AND	CSTMZ_CODE=P_C_Group_Code)
															   OR (CSTMZ_TYP=5 AND	CSTMZ_CODE=P_C_Class)
															   OR (CSTMZ_TYP=6 AND	CSTMZ_CODE=P_C_DEGREE)
															   OR (CSTMZ_TYP=7 AND	CSTMZ_CODE=P_CST_GRP_CSH)
															 THEN 1
															 ELSE 0
														       END
														     ) = 0 )
				    And (Case When Qt_Prm_Cst_Type In (2,3,4) And P_C_Code Is Not Null And P_C_Code  In (Select C_Code
												 From Ias_Cst_Expt_Qut_Prm
												Where Quot_Ser=M.Quot_Ser) Then 0 Else 1 End)=1
				    And (Case When NVL(M.BY_LEV_NO,0) =0 Then 1
					      When NVL(M.BY_LEV_NO,0) =1 And D.LEV_NO =  BD.PRICE_LVL  Then 1
					      Else 0 End)=1
				    And Nvl(M.Inactive,0)=0
				    And Nvl(M.APPROVED,0)= 1
				    And Decode(P_Bill_Doc_Type,4,2,8,2,1) = Decode(M.Bill_Doc_Type,Null,Decode(P_Bill_Doc_Type,4,2,8,2,1),M.Bill_Doc_Type)
				    And P_date Between M.F_Date And M.T_Date
				    And To_Char(To_Date(P_date),'D') In (M.Fld_Day1,M.Fld_Day2,M.Fld_Day3,M.Fld_Day4,M.Fld_Day5,M.Fld_Day6,M.Fld_Day7)
				    And Nvl(M.Use_qtn_prm_in_pos_sys_flg,0)=1
				    --And To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') >= Nvl(M.F_Time,To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS'))
				    --And To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') <= Nvl(M.T_Time,To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS'))
				    And (CASE WHEN M.F_Time IS NULL  OR M.F_Time IS NULL THEN 1
																  WHEN M.F_Time <=M.T_Time  AND To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') BETWEEN M.F_Time AND M.T_Time THEN 1
																  WHEN M.F_Time > M.T_Time  AND (To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') > M.F_Time OR To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') < M.T_Time ) THEN 1
																  ELSE 0
															      End)=1
				    Group By M.Quot_No,
					     M.Quot_Ser,
					     M.Qt_Prm_Type,
					     M.Qt_Prm_Method,
					     M.Qt_Prm_Cst_Type,
					     M.Qt_Prm_Wc_Type,
					     M.Calc_All_Slides,
					     M.Quot_cur,
					     D.Qt_I_Code,
					     D.Qt_Itm_Unt,
					     D.Rcrd_No,
					     D.Free_Qty,
					     D.Comp_Qty,
					     D.QT_PRM_GRP_NO,
					     GD.Prm_Grp_No,
					     GM.Grnt_Free_Qty_Typ,
					     M.By_Comp_Qty,
					     NVL(Gm.Chk_All_Itms,0),
					     Decode(M.Qt_Prm_Type,1,0,D.F_Qty),
					     Decode(M.Qt_Prm_Type,1,0,D.T_Qty),
					     D.Disc_type,
					     D.Disc_Amt_Per,
					     D.I_PRICE,
					     Decode(M.BY_LEV_NO,1,D.LEV_NO,NULL),
					     Decode(M.Qt_Prm_Wc_Type,1,D.W_Code,
								    2,D.Whg_Code ,
								    3,D.Cntry_No,
								    4,D.Prov_No,
								    5,D.City_No,
								    6,D.R_Code)
					    --M.BY_LEV_NO ,
					   -- Decode(M.BY_LEV_NO,1,D.LEV_NO, NULL)
				  Having (Case When M.Qt_Prm_Type=1 And Sum((Nvl(Bd.I_Qty,0)*Nvl(Bd.P_Size,0))/Nvl(GD.P_Size,0))>= Decode(Nvl(Gm.CHK_ALL_ITMS,0),0,Nvl(D.Comp_Qty,0),0) Then 1
					       When M.Qt_Prm_Type=2 And Nvl(M.Calc_All_Slides,0)=0 And Sum((Nvl(Bd.I_Qty,0)*Nvl(Bd.P_Size,0))/Nvl(GD.P_Size,0)) Between Nvl(Decode(M.Qt_Prm_Type,1,0,D.F_Qty),0) And Nvl(Decode(M.Qt_Prm_Type,1,0,D.T_Qty),0) Then 1
					       When M.Qt_Prm_Type=2 And Nvl(M.Calc_All_Slides,0)=1 And Sum((Nvl(Bd.I_Qty,0)*Nvl(Bd.P_Size,0))/Nvl(GD.P_Size,0))>=Nvl(Decode(M.Qt_Prm_Type,1,0,D.F_Qty),0) Then 1
					       Else 0 End)=1;

   V_Dis_Per	Number:=0;
   V_Dis_Amt	Number:=0;
   V_Dis_Amt_Vat Number:=0;
   V_Free_Qty	Number:=0;
   V_Cnt	Number:=0;
   V_Rcrd_No	Number:=0;
   V_Qt_I_Code	Ias_Itm_Mst.I_Code%Type;
   V_Qt_Itm_Unt Ias_Itm_Dtl.Itm_Unt%Type;
   V_W_Code	Number;
   V_Min_Qty	Number;
   V_Qty_Ic	Number;
   V_Qt_Grp_Bill_Amt Number;
   V_Qt_Grp_Bill_Amt_Vat Number;
   V_Use_Prc_Incld_Vat	Number;
BEGIN
  -----------------------------------------------------------------------------------------------------------------------------------
  Begin
      Update Ias_Pos_Hung_Bills D Set Dis_per=0,Dis_Amt_Dtl=0,Dis_Amt_Dtl_Vat=0,Chng_Flg=1
       Where  bill_no=p_bill_no
	 And Bill_Seq=P_Bill_Seq
	 And Qt_Prm_Ser Is Not Null
	 And Exists(Select 1 From Ias_Qut_Prm_Mst Where Quot_Ser=D.Qt_Prm_Ser And Qt_Prm_Type In (1,2) And Qt_Prm_Method In(6,11) And RowNum<=1);

      Update Ias_Pos_Hung_Bills D Set Qt_Free_Qty=0,Chng_Flg=1
       Where bill_no=p_bill_no
	 And Bill_Seq=P_Bill_Seq
	 And Qt_Prm_Ser Is Not Null
	 And Exists(Select 1 From Ias_Qut_Prm_Mst Where Quot_Ser=D.Qt_Prm_Ser And Qt_Prm_Type In (1,2) And Qt_Prm_Method In (7,10) And RowNum<=1);
  Exception when others then
    Null;
  End ;
  -----------------------------------------------------------------------------------------------------------------------------------
  Begin
      Select Use_Price_Include_Vat Into V_Use_Prc_Incld_Vat From Ias_Para_Gen;
  Exception When Others Then
      V_Use_Prc_Incld_Vat :=0;
  End;
  -----------------------------------------------------------------------------------------------------------------------------------
      For I In Qt_Prm Loop
	   If I.Qt_Prm_Type=1 Then
	       If I.Chk_All_Itms=1 Then
		    ------------------------------------------------------------------------------------------------------------
		    Begin
			Select 1 InTo V_Cnt From (Select I_Code,Itm_Unt,Sum(I_Qty) From ( Select I_Code,Itm_Unt,Nvl(I_Qty,0) I_Qty From IAS_QUT_PRM_GRP_DTL WHERE Prm_Grp_No=I.Prm_Grp_No
											  Union All
											  Select I_Code,Itm_Unt,Sum(Nvl(I_Qty,0))*-1 I_Qty From Ias_Pos_Hung_Bills Where Bill_seq=P_bill_seq  Group By I_Code,Itm_Unt
											 )
						   Group By I_Code,Itm_Unt
						   Having Sum(I_Qty)>0)
			Where RowNum<=1;
		    Exception When Others Then
			V_Cnt := 0;
		    End;
		    ------------------------------------------------------------------------------------------------------------
		    If Nvl(V_Cnt,0)=0 Then
		       --------------------------
		       Begin
			 /* Select trunc(Min(Nvl(D.I_qty,0)/Nvl(G.I_qty,0))) InTo V_Min_Qty
			     From IAS_BILL_DTL_ITM_TMP D,IAS_QUT_PRM_GRP_DTL G ,Ias_Qut_Prm_Dtl Q
			    Where D.I_Code     = G.I_Code
			      And D.Itm_Unt    = G.Itm_Unt
			      And Q.Quot_Ser   = I.Quot_Ser
			      And Q.Rcrd_No    = I.Rcrd_No
			      And Q.Quot_Ser = Nvl(P_Chk_Qt_Ser,Q.Quot_Ser)
			      And G.Prm_Grp_No = Q.Prm_Grp_No
			      And Decode(I.Qt_Prm_Wc_Type,1,Q.W_Code,
							  2,Q.Whg_Code ,
							  3,Q.Cntry_No,
							  4,Q.Prov_No,
							  5,Q.City_No,
							  6,Q.R_Code,0)=Nvl(I.W_Code,0);*/
			      Select (Min(sum(Nvl(D.I_qty,0))/(Nvl(G.I_qty,0)*Nvl(I.Comp_Qty,1)))) InTo V_Min_Qty
				 From Ias_Pos_Hung_Bills D,IAS_QUT_PRM_GRP_DTL G ,Ias_Qut_Prm_Dtl Q
				Where D.I_Code	   = G.I_Code
				  And D.Itm_Unt    = G.Itm_Unt
				  And Q.Quot_Ser   = I.Quot_Ser
				  And Q.Rcrd_No    = I.Rcrd_No
				  And Q.Quot_Ser = Nvl(P_Chk_Qt_Ser,Q.Quot_Ser)
				  And G.Prm_Grp_No = Q.Prm_Grp_No
				  And D.bill_no =p_bill_no
				  And D.Bill_Seq=P_Bill_Seq
				  And Decode(I.Qt_Prm_Wc_Type,1,Q.W_Code,
							      2,Q.Whg_Code ,
							      3,Q.Cntry_No,
							      4,Q.Prov_No,
							      5,Q.City_No,
							      6,Q.R_Code,0)=Nvl(I.W_Code,0)
							      GROUP BY D.I_Code,G.Itm_Unt,G.I_Qty;
		       Exception When Others Then
			V_Min_Qty := 0;
		       End;
		       ----------------------------
		       Begin
			   Select Sum(Nvl(D.I_qty,0)*Nvl(D.I_Price,0)),Sum(Nvl(D.I_qty,0)*Nvl(D.I_Price_Vat,0))
				   InTo V_Qt_Grp_Bill_Amt,V_Qt_Grp_Bill_Amt_Vat
				 From Ias_Pos_Hung_Bills D,IAS_QUT_PRM_GRP_DTL G ,Ias_Qut_Prm_Dtl Q
				Where D.I_Code	   = G.I_Code
				  And D.Itm_Unt    = G.Itm_Unt
				  And Q.Quot_Ser   = I.Quot_Ser
				  And Q.Rcrd_No    = I.Rcrd_No
				  And Q.Quot_Ser = Nvl(P_Chk_Qt_Ser,Q.Quot_Ser)
				  And G.Prm_Grp_No = Q.Prm_Grp_No
				  And D.bill_no =p_bill_no
				  And D.Bill_Seq=P_Bill_Seq
				  And Decode(I.Qt_Prm_Wc_Type,1,Q.W_Code,
							      2,Q.Whg_Code ,
							      3,Q.Cntry_No,
							      4,Q.Prov_No,
							      5,Q.City_No,
							      6,Q.R_Code,0)=Nvl(I.W_Code,0);
			Exception When Others Then
			  V_Qt_Grp_Bill_Amt := 0;
			  V_Qt_Grp_Bill_Amt_Vat:=0;
			End;
		       ----------------------------
		       Declare
			  Cursor C_Bill Is Select D.I_Code,D.Itm_Unt,D.I_Price,D.I_Price_Vat,D.Rcrd_No,D.DOC_D_SEQ,D.Bill_Seq,D.Bill_no,D.W_Code
						  --sum(Nvl(D.I_qty,0)) Bill_qty,sum(Nvl(G.I_qty,0)) Grp_qty
						  ,D.i_qty I_QTY_BILL
					     From Ias_Pos_Hung_Bills D,IAS_QUT_PRM_GRP_DTL G ,Ias_Qut_Prm_Dtl Q
					    Where D.I_Code     = G.I_Code
					      And D.Itm_Unt    = G.Itm_Unt
					      And Q.Quot_Ser   = I.Quot_Ser
					      And Q.Rcrd_No    = I.Rcrd_No
					      And G.Prm_Grp_No = Q.Prm_Grp_No
					      And D.bill_no=p_bill_no
					      And D.Bill_Seq=P_Bill_Seq
					      And Q.Quot_Ser = Nvl(P_Chk_Qt_Ser,Q.Quot_Ser)
					      And Decode(I.Qt_Prm_Wc_Type,1,Q.W_Code,
									  2,Q.Whg_Code ,
									  3,Q.Cntry_No,
									  4,Q.Prov_No,
									  5,Q.City_No,
									  6,Q.R_Code,0)=Nvl(I.W_Code,0)
					      And (Case When I.Qt_Prm_Cst_Type=0 Then 1
									  When I.Qt_Prm_Cst_Type=1 And Q.C_Code       = P_C_Code       Then 1
									  When I.Qt_Prm_Cst_Type=2 And Q.C_Group_Code = P_C_Group_Code Then 1
									  When I.Qt_Prm_Cst_Type=3 And Q.C_Class      = P_C_Class      Then 1
									  When I.Qt_Prm_Cst_Type=4 And Q.C_Degree     = P_C_Degree     Then 1
									  When I.Qt_Prm_Cst_Type=5 And P_c_code_csh Is Not Null Then 1
									  When I.Qt_Prm_Cst_Type=7 And Q.Cust_Grp_Code= P_Cst_Grp_Csh	  Then 1
									  When I.Qt_Prm_Cst_Type=8 And Q.C_Code_Csh   = Nvl(P_c_code_csh,'0')	Then 1
									  Else 0 End)=1	
					      Group By D.I_code,D.Itm_Unt,D.I_Price,D.I_Price_Vat,D.Bill_Seq,D.Bill_no,D.Rcrd_no,D.DOC_D_SEQ,D.W_code,D.i_qty
					      Order By D.Rcrd_No;
			  V_Qt_Iqty	  Number:=0;
			  V_Sum_Qty	  Number:=0;
			  V_Lst_Cpm_Iqty  Number:=0;
			Begin
			  For J In C_Bill Loop
			     IF I.Qt_Prm_Method<>7 Then
			       V_SUM_QTY:=NVL(V_SUM_QTY,0)+NVL(J.I_QTY_BILL,0);
			       V_LST_Cpm_Iqty:=I.I_Qty-Mod(I.I_Qty,I.Comp_Qty);
			     If V_SUM_QTY<= V_LST_Cpm_Iqty AND NVL(V_LST_Cpm_Iqty,0)>0 then
				    V_Dis_Per := 0;
				    V_Dis_Amt := 0;
				    V_Dis_Amt_Vat:= 0;
				    Begin
				      Select Sum(Nvl(I_qty,0)) InTo V_Qty_Ic
					   From Ias_Pos_Hung_Bills
					  Where I_Code =J.I_Code
					    And Itm_Unt=J.Itm_Unt
					    And bill_no=J.bill_no
					    And Bill_Seq=J.Bill_Seq;
				    Exception When Others Then
				       V_Qty_Ic :=0;
				    End;
				    If Nvl(I.Dis_Per,0)>0 Then
				      --V_Dis_Per :=((J.Grp_qty*V_Min_Qty*I.Dis_Per)/V_Qty_Ic)*Nvl(I.Comp_Qty,1);
				      --V_Dis_Amt := (nvl(J.I_Price,0)*nvl(V_Dis_Per,0))/100;
				      --V_Dis_Amt_Vat:=(nvl(J.I_Price_Vat,0)*nvl(V_Dis_Per,0))/100;  20-12-2025
				      V_Dis_Per :=I.Dis_Per;
				      V_Dis_Amt := (nvl(J.I_Price,0)*nvl(V_Dis_Per,0))/100;
				      V_Dis_Amt_Vat:=(nvl(J.I_Price_Vat,0)*nvl(V_Dis_Per,0))/100;
				    ElsIf Nvl(I.Dis_Amt,0)>0 And Nvl(J.I_Price,0)>0 Then
				      /*V_Dis_Per := (I.Dis_Amt/J.I_Price)*100;
				      V_Dis_Per := (J.Grp_qty*V_Min_Qty*V_Dis_Per)/J.Bill_qty;
				      V_Dis_Amt := I.Dis_Amt;*/


				      V_Dis_Amt :=((((100 * nvl(V_Min_Qty*I.Dis_Amt,0))/V_Qt_Grp_Bill_Amt)*Nvl(J.I_Price,0))/100);--V_Dis_Amt := I.Dis_Amt/V_Qty_Ic;
				    If Nvl(J.I_Price_Vat,0)>0 Then
				      V_Dis_Amt_Vat :=((((100 * nvl(V_Min_Qty*I.Dis_Amt,0))/V_Qt_Grp_Bill_Amt_Vat)*Nvl(J.I_Price_Vat,0))/100);--V_Dis_Amt := I.Dis_Amt/V_Qty_Ic;
				    End If;
				      V_Dis_Per := (V_Dis_Amt/J.I_Price)*100;
				    End If;

				    Update Ias_Pos_Hung_Bills Set Dis_Amt_Dtl	 = V_Dis_Amt,
								  Dis_Amt_Dtl_Vat= V_Dis_Amt_Vat,
								    Dis_per	   = V_Dis_Per,
								    Qt_Prm_No	   = I.Quot_No,
								    Qt_Prm_Ser	   = I.Quot_Ser,
								    Qt_Prm_Rcrd_No = I.Rcrd_No,
								    Chng_Flg	   = 1
				     Where I_Code	= J.I_Code
				       And Rcrd_No	= J.Rcrd_No
				       And DOC_D_SEQ	= J.DOC_D_SEQ
				       And bill_no	= J.bill_no
				       And Bill_Seq	= J.Bill_Seq  ;
			      End If;
			    Else
				  V_Qt_I_Code  := I.Qt_I_Code;
				  V_Qt_Itm_Unt := I.Qt_Itm_Unt;
				  Get_Prm_Grp_Icode ( P_Prm_Grp_No	  => I.Prm_Grp_No,
						      P_Grnt_Free_Qty_Typ => I.Grnt_Free_Qty_Typ,
						      P_Qt_I_Code	  => V_Qt_I_Code,
						      P_Qt_Itm_Unt	  => V_Qt_Itm_Unt);
				  Begin
				    Select Max(Rcrd_No) Into V_Rcrd_No From Ias_Pos_Hung_Bills
				     Where bill_no=j.bill_no
				       And Bill_Seq=j.Bill_Seq;
				    Exception When Others Then
				      V_Rcrd_No:=1;
				  End;

				   Begin
				    Select 1 InTo V_Cnt
				      From Ias_Pos_Hung_Bills
				     Where I_Code		 = V_Qt_I_Code
				       And Itm_Unt		 = V_Qt_Itm_Unt
				       And Nvl(Qt_Prm_No,0)	 = I.Quot_No
				       And Nvl(Qt_Prm_Ser,0)	 = I.Quot_Ser
				       And Nvl(Qt_Prm_Rcrd_No,0) = I.Rcrd_No
				       And Ias_Get_Qt_Prm_Method (Nvl(I.Quot_Ser,0))=7
				       And bill_no=j.bill_no
				       And Bill_Seq=j.Bill_Seq
				       And RowNum<=1;
				  Exception When Others Then
				    V_Cnt := 0;
				  End;

				  If Nvl(V_Cnt,0)=0 And (I.Qt_Qty*I.Free_Qty)>0 And V_Qt_I_Code Is Not Null And V_Qt_Itm_Unt Is Not Null
					Then
					  INSERT INTO Ias_Pos_Hung_Bills
							(bill_no,
							 bill_seq,
							 i_code,
							 itm_unt,
							 p_size,
							 i_qty,
							 Qt_Free_qty,
							 i_price,
							 w_code,
							-- c_code,
							 dis_per,
							 dis_amt_dtl,
							 dis_amt_dtl_Vat,
							 rcrd_no,
							 DOC_D_SEQ,
							 qt_prm_no,
							 qt_prm_ser,
							 qt_prm_rcrd_no,
							 Prm_Grp_No,
							 chng_flg,
							 --lev_no
							 Cmp_no,
							 Brn_no
							)
						 VALUES (j.bill_no,
							 j.bill_seq,
							 V_Qt_I_Code,
							 V_Qt_Itm_Unt,
							 Ias_Itm_Pkg.Get_Icode_Size_Unit ( P_I_Code => V_Qt_I_Code,P_Itm_Unt => V_Qt_Itm_Unt),
							 null,
							 I.Qt_Qty*I.Free_Qty,
							 null,
							 J.W_Code,
							-- null,
							 0,
							 0,
							 0,
							 V_Rcrd_No,
							 POS_BILL_DTL_SEQ.Nextval,
							 I.Quot_No,
							 I.Quot_Ser,
							 I.Rcrd_No,
							 I.Prm_Grp_No,
							 1,--, I.lev_no
							 1,
							 1
							);
				  Else
				       Update Ias_Pos_Hung_Bills Set Qt_Free_qty= I.Qt_Qty*I.Free_Qty,chng_flg=1
					Where I_Code	     = V_Qt_I_Code
					  And Itm_Unt	     = V_Qt_Itm_Unt
					  And Nvl(Qt_Prm_No,0)	    = I.Quot_No
					  And Nvl(Qt_Prm_Ser,0)     = I.Quot_Ser
					  And Nvl(Qt_Prm_Rcrd_No,0) = I.Rcrd_No
					  And Ias_Get_Qt_Prm_Method (Nvl(I.Quot_Ser,0))=7
					  And bill_no =j.bill_no
					  And Bill_Seq=j.Bill_Seq;
				  End If;
			     End If;
			   End Loop;
			End;
		    End If;
		    ------------------------------------------------------------------------------------------------------------
	       Else
		    Declare
		      Cursor C_Bill Is Select D.I_Code,D.Itm_Unt,D.I_Price,D.I_Price_Vat,D.Bill_Seq,D.Bill_no,D.Rcrd_No,D.DOC_D_SEQ,D.W_Code,D.I_QTY I_QTY_BILL
		       From Ias_Pos_Hung_Bills D,Ias_Qut_Prm_Grp_Dtl G ,Ias_Qut_Prm_Dtl Q
					Where D.I_Code	   = G.I_Code
					  And D.Itm_Unt    = G.Itm_Unt
					  And Q.Quot_Ser   = I.Quot_Ser
					  And Q.Rcrd_No    = I.Rcrd_No
					  And G.Prm_Grp_No = Q.Prm_Grp_No
					  And D.bill_no=p_bill_no
					  And D.Bill_Seq=P_Bill_Seq
					  And Q.Quot_Ser = Nvl(P_Chk_Qt_Ser,Q.Quot_Ser)
					  And Decode(I.Qt_Prm_Wc_Type,1,Q.W_Code,
								      2,Q.Whg_Code ,
								      3,Q.Cntry_No,
								      4,Q.Prov_No,
								      5,Q.City_No,
								      6,Q.R_Code,0)=Nvl(I.W_Code,0)
					  And (Case When I.Qt_Prm_Cst_Type=0 Then 1
									  When I.Qt_Prm_Cst_Type=1 And Q.C_Code       = P_C_Code       Then 1
									  When I.Qt_Prm_Cst_Type=2 And Q.C_Group_Code = P_C_Group_Code Then 1
									  When I.Qt_Prm_Cst_Type=3 And Q.C_Class      = P_C_Class      Then 1
									  When I.Qt_Prm_Cst_Type=4 And Q.C_Degree     = P_C_Degree     Then 1
									  When I.Qt_Prm_Cst_Type=5 And P_c_code_csh Is Not Null Then 1
									  When I.Qt_Prm_Cst_Type=7 And Q.Cust_Grp_Code= P_Cst_Grp_Csh	  Then 1
									  When I.Qt_Prm_Cst_Type=8 And Q.C_Code_Csh   = Nvl(P_c_code_csh,'0')	Then 1
									  Else 0 End)=1
					  Order By D.Rcrd_No;
		      V_Qt_Iqty       Number:=0;
		      V_Lst_Cpm_Iqty Number:=0;
		      V_Sum_Qty      Number:=0;
		    Begin
		       V_Sum_Qty:=0;
		      For J In C_Bill Loop
		      IF I.Qt_Prm_Method<>7 Then
			    V_Dis_Per := 0;
			    V_Dis_Amt := 0;
			    V_Dis_Amt_Vat:=0;

			    V_SUM_QTY:=NVL(V_SUM_QTY,0)+NVL(J.I_QTY_BILL,0);
			    V_LST_Cpm_Iqty:=I.I_Qty-Mod(I.I_Qty,I.Comp_Qty);
			If V_SUM_QTY<= V_LST_Cpm_Iqty AND NVL(V_LST_Cpm_Iqty,0)>0 Then
			    If Nvl(I.Dis_Per,0)>0 Then
			      V_Dis_Per := I.Dis_Per;
			      V_Dis_Amt := (nvl(J.I_Price,0)*nvl(I.Dis_Per,0))/100;
			      V_Dis_Amt_Vat := (nvl(J.I_Price_Vat,0)*nvl(I.Dis_Per,0))/100;

			      Update Ias_Pos_Hung_Bills Set --Dis_Amt_Dtl    = ((I.I_Qty-Mod(I.I_Qty,I.Comp_Qty))*(V_Dis_Per/100)*J.I_Price)/I.I_Qty,
							    --Dis_Amt_Dtl_Vat= ((I.I_Qty-Mod(I.I_Qty,I.Comp_Qty))*(V_Dis_Per/100)*J.I_Price_Vat)/I.I_Qty,
							    --Dis_per	     = ((((I.I_Qty-Mod(I.I_Qty,I.Comp_Qty))*(V_Dis_Per/100)*J.I_Price)/I.I_Qty)/J.I_Price)*100,
							    Dis_Amt_Dtl    =V_Dis_Amt,
							    Dis_Amt_Dtl_Vat=V_Dis_Amt_Vat,
							    Dis_per	   =V_Dis_Per,
							    Qt_Prm_No	   = I.Quot_No,
							    Qt_Prm_Ser	   = I.Quot_Ser,
							    Qt_Prm_Rcrd_No = I.Rcrd_No,
							    Chng_Flg	   = 1
			     Where I_Code    = J.I_Code
			       And Rcrd_No   = J.Rcrd_No
			       And DOC_D_SEQ = J.DOC_D_SEQ
			       And bill_no   = J.bill_no
			       And Bill_Seq  = J.Bill_Seq
			       And I.I_Qty>0
			       And J.I_Price>0;

			    ElsIf Nvl(I.Dis_Amt,0)>0 And Nvl(J.I_Price,0)>0 Then
			    If Nvl(I.Comp_Qty,0)>0 Then
			      Declare
				V_I_Price_Grp number;
				V_I_Price_Grp_Vat number;
				V_CNT_RCRD  number;
				V_Prm_Grp_Dis_Amt number;
			      Begin
				    Begin
				     SELECT Sum(I_Price*Nvl(I_Qty,0)),Sum(I_Price_Vat*Nvl(I_Qty,0)),Count(DOC_D_SEQ)
				       Into V_I_Price_Grp,V_I_Price_Grp_Vat,V_CNT_RCRD
					  FROM (
					  SELECT Itm_bill.*,ROW_NUMBER() OVER (ORDER BY DOC_D_SEQ) RN,
					  COUNT(*) OVER () TOTAL_ROWS
					   FROM IAS_POS_HUNG_BILLS Itm_bill
					    WHERE Bill_No =P_Bill_No
					      And Bill_Seq=P_Bill_Seq
					      And Exists ( Select 1 From Ias_Qut_Prm_Grp_Dtl
						      Where I_Code     =Itm_bill.I_Code
							And Itm_Unt    =Itm_bill.Itm_Unt
							And Prm_Grp_No =I.Prm_Grp_No
							And Rownum<=1)
						 )
					  WHERE RN<=TOTAL_ROWS-MOD(TOTAL_ROWS,I.COMP_QTY)
					  ;
				    Exception When Others Then
				       V_I_Price_Grp	:=0;
				       V_I_Price_Grp_Vat:=0;
				    End;
				    IF V_CNT_RCRD/I.COMP_QTY>1 Then
					V_Prm_Grp_Dis_Amt:=Nvl(I.Dis_Amt,0)* (V_CNT_RCRD/I.COMP_QTY);
				    Else
					V_Prm_Grp_Dis_Amt:=Nvl(I.Dis_Amt,0);
				    End If;
				    If Nvl(V_Use_Prc_Incld_Vat,0)=1 And Nvl(V_I_Price_Grp_Vat,0)>0 Then
				      V_I_Price_Grp:=V_I_Price_Grp_Vat;
				    End If;
				    If Nvl(V_I_Price_Grp,0)>0 And Nvl(V_I_Price_Grp,0)>Nvl(V_Prm_Grp_Dis_Amt,0)  Then
				      V_Dis_Per:=Nvl(V_Prm_Grp_Dis_Amt,0)/V_I_Price_Grp;
				      If Nvl(V_Dis_Per,0)>0 Then
					Update Ias_Pos_Hung_Bills Set Dis_Amt_Dtl  =(V_Dis_Per*I_Price),
								    Dis_Amt_Dtl_Vat=V_Dis_Per*I_Price_Vat,
								    Dis_Per	   = V_Dis_Per*100,
								    Qt_Prm_No	   = I.Quot_No,
								    Qt_Prm_Ser	   = I.Quot_Ser,
								    Qt_Prm_Rcrd_No = I.Rcrd_No,
								    Qt_Prm_Method  = 11,
								    Prm_Grp_No	   = I.Prm_Grp_No,
								    Chng_Flg	   = 1
					Where Bill_No=P_Bill_No
					And Bill_Seq=P_Bill_Seq
					And I_Qty>0
					And I_Price>0
					And  Exists ( Select 1 From Ias_Qut_Prm_Grp_Dtl
					     Where I_Code     =Ias_Pos_Hung_Bills.I_Code
					       And Itm_Unt    =Ias_Pos_Hung_Bills.Itm_Unt
					       And Prm_Grp_No =I.Prm_Grp_No
					       And Rownum<=1)
					And DOC_D_SEQ In (SELECT DOC_D_SEQ
						       FROM (
							    SELECT Itm_bill.*,ROW_NUMBER() OVER (ORDER BY DOC_D_SEQ) RN,
							    COUNT(*) OVER () TOTAL_ROWS FROM IAS_POS_HUNG_BILLS Itm_bill
							      WHERE Bill_No=P_Bill_No
								And Bill_Seq=P_Bill_Seq
								and Exists ( Select 1 From Ias_Qut_Prm_Grp_Dtl
									 Where I_Code	  =Itm_bill.I_Code
									   And Itm_Unt	  =Itm_bill.Itm_Unt
									   And Prm_Grp_No =I.Prm_Grp_No
									    And Rownum<=1)
							     )
							      WHERE RN<=TOTAL_ROWS-MOD(TOTAL_ROWS,I.COMP_QTY)
							    );
				     End If;
				    End If;
			      End;--i.comp_qty
			     Else
			      Update Ias_Pos_Hung_Bills Set Dis_Amt_Dtl      = (I.Qt_Qty/I.I_Qty)*I.Dis_Amt,
							    Dis_Amt_Dtl_Vat  = (I.Qt_Qty/I.I_Qty)*I.Dis_Amt,
								Dis_per        =  (((I.Qt_Qty/I.I_Qty)*I.Dis_Amt)/J.I_Price)*100,
								Qt_Prm_No      = I.Quot_No,
								Qt_Prm_Ser     = I.Quot_Ser,
								Qt_Prm_Rcrd_No = I.Rcrd_No,
								Chng_Flg       = 1
				 Where I_Code	 = J.I_Code
				   And Rcrd_No	 = J.Rcrd_No
				   And DOC_D_SEQ = J.DOC_D_SEQ
				   And bill_no	 = J.bill_no
				   And Bill_Seq  = J.Bill_Seq
				   And I.I_Qty>0
				   And J.I_Price>0;
			      --V_Dis_Per := (I.Dis_Amt/J.I_Price)*100;
			      --V_Dis_Amt := I.Dis_Amt;
			    End If; --
			   End If;
			 End If;
		      ElsIf I.Qt_Prm_Method=7 Then
			      V_Qt_I_Code  := I.Qt_I_Code;
			      V_Qt_Itm_Unt := I.Qt_Itm_Unt;
			      Get_Prm_Grp_Icode ( P_Prm_Grp_No	      => I.Prm_Grp_No,
						  P_Grnt_Free_Qty_Typ => I.Grnt_Free_Qty_Typ,
						  P_Qt_I_Code	      => V_Qt_I_Code,
						  P_Qt_Itm_Unt	      => V_Qt_Itm_Unt);
			      Begin
				    Select 1 InTo V_Cnt
				      From Ias_Pos_Hung_Bills
				     Where I_Code		 = V_Qt_I_Code
				       And Itm_Unt		 = V_Qt_Itm_Unt
				       And Nvl(Qt_Prm_No,0)	 = I.Quot_No
				       And Nvl(Qt_Prm_Ser,0)	 = I.Quot_Ser
				       And Nvl(Qt_Prm_Rcrd_No,0) = I.Rcrd_No
				       And bill_no   = J.bill_no
				       And Bill_Seq  = J.Bill_Seq
				       And Ias_Get_Qt_Prm_Method (Nvl(I.Quot_Ser,0))=7
				       And RowNum<=1;
			      Exception When Others Then
				V_Cnt := 0;
			      End;

			      If Nvl(V_Cnt,0)=0 And (I.Qt_Qty*I.Free_Qty)>0 And V_Qt_I_Code Is Not Null And V_Qt_Itm_Unt Is Not Null
				  Then
				      INSERT INTO Ias_Pos_Hung_Bills
						    (bill_no,
						     bill_seq,
						     i_code,
						     itm_unt,
						     p_size,
						     i_qty,
						     Qt_Free_qty,
						     i_price,
						     w_code,
						     --c_code,
						     dis_per,
						     dis_amt_dtl,
						     rcrd_no,
						     DOC_D_SEQ,
						     qt_prm_no,
						     qt_prm_ser,
						     qt_prm_rcrd_no,
						     Prm_Grp_No,
						     chng_flg,
						     --lev_no
						     Cmp_no,
						     Brn_no
						    )
					     VALUES (j.bill_no,
						     j.bill_seq,
						     V_Qt_I_Code,
						     V_Qt_Itm_Unt,
						     Ias_Itm_Pkg.Get_Icode_Size_Unit ( P_I_Code => V_Qt_I_Code,P_Itm_Unt => V_Qt_Itm_Unt),
						     null,
						     Decode(I.Qt_Prm_Type,2,I.Free_Qty,I.Qt_Qty*I.Free_Qty),
						     null,
						     --null,
						     null,
						     0,
						     0,
						     V_Rcrd_No,
						     POS_BILL_DTL_SEQ.Nextval,
						     I.Quot_No,
						     I.Quot_Ser,
						     I.Rcrd_No,
						     I.Prm_Grp_No,
						     1,
						     --i.lev_no
						     1,
						     1
						    );
			      Else
				   Update Ias_Pos_Hung_Bills Set Qt_Free_qty= I.Qt_Qty*I.Free_Qty,chng_flg=1
				    Where I_Code	 = V_Qt_I_Code
				      And Itm_Unt	 = V_Qt_Itm_Unt
				      And Qt_Prm_No	 = I.Quot_No
				      And Qt_Prm_Ser	 = I.Quot_Ser
				      And Qt_Prm_Rcrd_No = I.Rcrd_No
				      And bill_no   = J.bill_no
				      And Bill_Seq  = J.Bill_Seq
				      And Ias_Get_Qt_Prm_Method (I.Quot_Ser)=7;
			      End If;
			    End If;
		      End Loop;
		    ENd;
		    ------------------------------------------------------------------------------------------------------------
	       End If;
	   ElsIf I.Qt_Prm_Type=2 Then
	      If I.Qt_Prm_Method=6 Then
		      If I.Calc_All_Slides=1 And Nvl(I.I_Qty,0)>0 Then
			   Select Sum(Case When Disc_type=1 And D.T_qty<=I.I_qty Then (((D.T_qty-Lag_qty.L_qty)*(D.Disc_amt_per/100))/I.I_qty)
					   When Disc_type=1 And D.T_qty>I.I_qty Then (((I.I_qty-Lag_qty.L_qty)*(D.Disc_amt_per/100))/I.I_qty)
				      End)*100,
				     Sum(Case When Disc_type=2 And D.T_qty<=I.I_qty Then (((D.T_qty-Lag_qty.L_qty)*D.Disc_amt_per)/I.I_qty)
					      When Disc_type=2 And D.T_qty>I.I_qty  Then (((I.I_qty-Lag_qty.L_qty)*D.Disc_amt_per)/I.I_qty)
				      End)
			      Into V_dis_per,
				    V_dis_amt
			      From Ias_qut_prm_mst M,Ias_qut_prm_dtl D,(Select Quot_ser,Rcrd_no,Nvl(Lag (T_qty)  Over (Partition By Quot_no Order By T_qty),0) L_qty From Ias_qut_prm_dtl) Lag_qty
			     Where M.Quot_ser	= D.Quot_ser
			       And M.Quot_ser	= I.Quot_ser
			       And D.Prm_grp_no = I.Prm_grp_no
			       And Lag_qty.Quot_ser=M.Quot_ser
			       And Lag_qty.Quot_ser=D.Quot_ser
			       And Lag_qty.Rcrd_no=D.Rcrd_no
			       And D.F_qty<=I.I_qty;
		      ElsIf I.Calc_All_Slides=0 Then
			   Begin
			       Select Decode(Disc_type,1,Disc_Amt_Per) ,
				      Decode(Disc_type,2,Nvl(round(Disc_Amt_Per * Ias_Gen_Pkg.Get_Cur_rate(M.Quot_cur)/P_Bill_Rate,P_No_Of_Dcml),0))  --
				   InTo V_Dis_Per,
					V_Dis_Amt
				  From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D
				 Where M.Quot_Ser   = D.Quot_Ser
				   And M.Quot_Ser   = I.Quot_Ser
				   And D.Prm_Grp_No = I.Prm_Grp_No
				   And I.I_Qty Between D.F_Qty And D.T_Qty
				  And (Case When M.Qt_Prm_Wc_Type=0 Then 1
					    When M.Qt_Prm_Wc_Type=1 And D.W_Code   = I.W_Code Then 1
					    When M.Qt_Prm_Wc_Type=2 And D.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=I.W_Code And RowNum<=1) Then 1
					    When M.Qt_Prm_Wc_Type=3 And D.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=I.W_Code And RowNum<=1) Then 1
					    When M.Qt_Prm_Wc_Type=4 And D.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=I.W_Code And RowNum<=1) Then 1
					    When M.Qt_Prm_Wc_Type=5 And D.City_No  =(Select City_No  From Warehouse_Details Where W_Code=I.W_Code And RowNum<=1) Then 1
					    When M.Qt_Prm_Wc_Type=6 And D.R_Code   =(Select R_Code   From Warehouse_Details Where W_Code=I.W_Code And RowNum<=1) Then 1
					    Else 0 End)=1
				   And RowNum<=1;
			     Exception when others then
			       V_Dis_Per :=0;
			       V_Dis_Amt :=0;
			     End;
		      End If;

		     Update Ias_Pos_Hung_Bills a Set Dis_Amt_Dtl    = (Case When Nvl(V_Dis_Per,0)>0 Then  (nvl(I_Price,0)*nvl(V_Dis_Per,0))/100
									      When Nvl(V_Dis_Amt,0)>0 And Nvl(I_Price,0)>0 Then  V_Dis_Amt
									      Else 0 End),
						      Dis_Amt_Dtl_Vat	 = (Case When Nvl(V_Dis_Per,0)>0 Then  (nvl(I_Price_Vat,0)*nvl(V_Dis_Per,0))/100
									      When Nvl(V_Dis_Amt,0)>0 And Nvl(I_Price_Vat,0)>0 Then  V_Dis_Amt
									      Else 0 End),
						       Dis_per	      = (Case When Nvl(V_Dis_Per,0)>0 Then  V_Dis_Per
									      When Nvl(V_Dis_Amt,0)>0 And Nvl(I_Price,0)>0 Then  (V_Dis_Amt/I_Price)*100
									      Else 0 End),
						       Qt_Prm_No      = I.Quot_No,
						       Qt_Prm_Ser     = I.Quot_Ser,
						       Qt_Prm_Rcrd_No = I.Rcrd_No,
						       Chng_Flg       = 1
		     Where bill_no=P_bill_no
		      And Bill_Seq=P_Bill_Seq
		      And  Exists ( Select 1 From IAS_QUT_PRM_GRP_DTL
				     Where I_Code     = a.I_Code
				       And Itm_Unt    = a.Itm_Unt
				       And Prm_Grp_No = I.Prm_Grp_No
				       And RowNum<=1);

	      ElsIf I.Qt_Prm_Method=7 Then
		 Begin
		  Select  TRUNC(SUM(Case When D.T_Qty<=I.I_Qty And I.Calc_All_Slides=1 Then TRUNC((T_Qty-F_Qty+1)/Decode(I.By_Comp_Qty,1,Comp_Qty,(T_Qty-F_Qty+1)))--*Free_Qty
					 When D.T_Qty>I.I_Qty  And I.Calc_All_Slides=1 Then TRUNC((I.I_Qty-F_Qty+1)/Decode(I.By_Comp_Qty,1,Comp_Qty,(T_Qty-F_Qty+1)))--*Free_Qty
					 When I.Calc_All_Slides=0 And (I.I_Qty Between D.F_Qty And D.T_Qty) And I.Calc_All_Slides=0 Then TRUNC(TRUNC(I.I_Qty/Decode(I.By_Comp_Qty,1,Nvl(Comp_Qty,1),I.I_Qty)))--*Free_Qty)
			   End))
		   InTo V_Free_Qty
		   From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D
		  Where M.Quot_Ser	= D.Quot_Ser
		    And M.Quot_Ser	= I.Quot_Ser
		    And M.Qt_Prm_Method = 7
		    And D.Prm_Grp_No	= I.Prm_Grp_No
		    And D.F_Qty<=I.I_Qty
		    AND Decode(NVL(M.Qt_Prm_Wc_Type,0), 1,D.W_Code   ,
							2,D.Whg_Code ,
							3,D.Cntry_No ,
							4,D.Prov_No  ,
							5,D.City_No  ,
							6,D.R_Code   ,
							0) =Decode(NVL(M.Qt_Prm_Wc_Type,0) ,0,0, I.W_CODE )
		    And (Case
		      When M.Qt_Prm_Cst_Type=0 Then 1
		      When M.Qt_Prm_Cst_Type=1 And D.C_Code	  = P_C_Code	   Then 1
		      When M.Qt_Prm_Cst_Type=2 And D.C_Group_Code = P_C_Group_Code Then 1
		      When M.Qt_Prm_Cst_Type=3 And D.C_Class	  = P_C_Class	   Then 1
		      When M.Qt_Prm_Cst_Type=4 And D.C_Degree	  = P_C_Degree	   Then 1
		      When M.Qt_Prm_Cst_Type=5 And D.City_No Is Not Null Then 1
		      When M.Qt_Prm_Cst_Type=7 And D.Cust_Grp_Code  = P_Cst_Grp_Csh Then 1
		      When M.Qt_Prm_Cst_Type=8 And D.C_Code_Csh     = P_c_code_csh  Then 1
		      Else 0 End)=1 ;
		 Exception When Others Then
		    V_Free_Qty := 0;
		  End;
		  V_Qt_I_Code  := I.Qt_I_Code;
		  V_Qt_Itm_Unt := I.Qt_Itm_Unt;
		  Get_Prm_Grp_Icode ( P_Prm_Grp_No	  => I.Prm_Grp_No,
				      P_Grnt_Free_Qty_Typ => I.Grnt_Free_Qty_Typ,
				      P_Qt_I_Code	  => V_Qt_I_Code,
				      P_Qt_Itm_Unt	  => V_Qt_Itm_Unt);
		  Begin
			Select W_Code InTo V_W_Code
			  From Ias_Pos_Hung_Bills
			 Where bill_no=P_bill_no
			   And Bill_Seq=P_Bill_Seq
			   And W_Code Is Not Null
			   And RowNum<=1;
		  Exception When Others Then
		    V_Cnt := 0;
		  End;

		  Begin
			Select 1 InTo V_Cnt
			  From Ias_Pos_Hung_Bills
			 Where I_Code		     = V_Qt_I_Code
			   And Itm_Unt		     = V_Qt_Itm_Unt
			   And Nvl(Qt_Prm_No,0)      = I.Quot_No
			   And Nvl(Qt_Prm_Ser,0)     = I.Quot_Ser
			   And Nvl(Prm_Grp_No,0)     = I.Prm_Grp_No
			   And Ias_Get_Qt_Prm_Method (Nvl(I.Quot_Ser,0))=7
			   And Nvl(Qt_Prm_Rcrd_No,0) = I.Rcrd_No
			   And bill_no =P_bill_no
			   And Bill_Seq=P_Bill_Seq
			   And RowNum<=1;
		  Exception When Others Then
		    V_Cnt := 0;
		  End;

		  If Nvl(V_Cnt,0)=0 And Nvl(V_Free_Qty,0)>0 And V_Qt_I_Code Is Not Null And V_Qt_Itm_Unt Is Not Null
		     Then
			  INSERT INTO Ias_Pos_Hung_Bills
					(Bill_No,
					 Bill_Seq,
					 i_code,
					 itm_unt,
					 p_size,
					 i_qty,
					 Qt_Free_qty,
					 i_price,
					 w_code,
					 --c_code,
					 dis_per,
					 dis_amt_dtl,
					 rcrd_no,
					 DOC_D_SEQ,
					 qt_prm_no,
					 qt_prm_ser,
					 qt_prm_rcrd_no,
					 Prm_Grp_No,
					 chng_flg,
					 --lev_no
					 Cmp_no,
					 Brn_no
					)
				 VALUES (P_Bill_no,
					 P_Bill_Seq,
					 V_Qt_I_Code,
					 V_Qt_Itm_Unt,
					 Ias_Itm_Pkg.Get_Icode_Size_Unit ( P_I_Code => V_Qt_I_Code,P_Itm_Unt => V_Qt_Itm_Unt),
					 null,
					 V_Free_qty    * I.Free_Qty ,
					 null,
					 null,
					 --null,
					 0,
					 0,
					 V_Rcrd_No,
					 POS_BILL_DTL_SEQ.Nextval,
					 I.Quot_No,
					 I.Quot_Ser,
					 I.Rcrd_No,
					 I.Prm_Grp_No,
					 1,
					 --i.lev_no
					 1,
					 1
					);
		  Else
		       Update Ias_Pos_Hung_Bills Set Qt_Free_qty= V_Free_Qty * I.Free_Qty
						     ,chng_flg=1
			Where I_Code	     = V_Qt_I_Code
			  And Itm_Unt	     = V_Qt_Itm_Unt
			  And Qt_Prm_No      = I.Quot_No
			  And Qt_Prm_Ser     = I.Quot_Ser
			  And Prm_Grp_No     = I.Prm_Grp_No
			  And bill_no	     = P_bill_no
			  And Bill_Seq	     = P_Bill_Seq
			  And Ias_Get_Qt_Prm_Method (I.Quot_Ser)=7;
		  End If;
	      --##GRP free From GRP--------------------
	      ELSIF I.QT_PRM_METHOD = 10 Then
			     Declare
			      Cursor C_Itm_Grp_Free Is
					  SELECT G.I_CODE,
						 G.itm_Unt,
						 G.I_QTY
					    FROM IAS_QUT_PRM_GRP_DTL G, IAS_QUT_PRM_DTL Q
					   WHERE Q.QUOT_SER = I.QUOT_SER
					     AND Q.RCRD_NO = I.RCRD_NO
					     AND G.PRM_GRP_NO = Q.Qt_PRM_GRP_NO
					     AND Q.QUOT_SER = NVL(P_CHK_QT_SER, Q.QUOT_SER)
					     And G.Prm_Grp_No=I.Qt_PRM_GRP_NO
					     AND DECODE(I.QT_PRM_WC_TYPE,  1, Q.W_CODE,  2, Q.WHG_CODE,  3, Q.CNTRY_NO,  4, Q.PROV_NO,	5, Q.CITY_NO,  6, Q.R_CODE,  0) = NVL(I.W_CODE, 0)
					ORDER BY G.RCRD_NO;
			     Begin
				 For K in C_Itm_Grp_Free
				 Loop
				   BEGIN
					SELECT MAX(RCRD_NO) INTO V_RCRD_NO FROM IAS_POS_HUNG_BILLS  Where Bill_Seq=P_Bill_Seq;
				    EXCEPTION
					WHEN OTHERS THEN
					    V_RCRD_NO := 1;
				    END;
				    BEGIN
					SELECT 1
					  INTO V_CNT
					  FROM IAS_POS_HUNG_BILLS
					 WHERE	Bill_Seq=P_Bill_Seq And I_CODE = K.I_Code AND ITM_UNT = K.Itm_Unt AND NVL(QT_PRM_NO, 0)= I.QUOT_NO AND NVL(QT_PRM_SER, 0) = I.QUOT_SER
					 AND NVL(QT_PRM_RCRD_NO, 0) = I.RCRD_NO AND IAS_GET_QT_PRM_METHOD(NVL(I.QUOT_SER, 0)) = 10 AND ROWNUM <= 1;
				    EXCEPTION
					WHEN OTHERS THEN
					    V_CNT := 0;
				    END;
				    IF NVL(V_CNT, 0) = 0 AND  I.FREE_QTY > 0 And K.I_Code IS NOT NULL AND K.Itm_Unt IS NOT NULL  THEN
					INSERT INTO IAS_POS_HUNG_BILLS(  bill_no,
									 Bill_Seq,
									 I_CODE,
									 ITM_UNT,
									 P_SIZE,
									 I_QTY,
									 QT_FREE_QTY,
									 I_PRICE,
									 W_CODE,
									 DIS_PER,
									 DIS_AMT_DTL,
									 RCRD_NO,
									 Doc_D_Seq,
									 QT_PRM_NO,
									 QT_PRM_SER,
									 QT_PRM_RCRD_NO,
									 PRM_GRP_NO,
									 CHNG_FLG,
									 PRICE_LVL,
									 Cmp_no,
									 Brn_no )
					     VALUES (P_bill_no,
						     P_Bill_Seq,
						     K.I_Code,
						     K.Itm_Unt,
						     IAS_ITM_PKG.GET_ICODE_SIZE_UNIT(P_I_CODE => K.I_Code, P_ITM_UNT => K.Itm_Unt),
						     NULL,
						     Nvl(k.I_Qty,1),
						     NULL,
						     NULL,
						     0,
						     0,
						     V_RCRD_NO,
						     POS_BILL_DTL_SEQ.NEXTVAL,
						     I.QUOT_NO,
						     I.QUOT_SER,
						     I.RCRD_NO,
						     I.PRM_GRP_NO,
						     1,
						     I.PRICE_LVL,
						     1,
						     1);
				    Else
				      Update IAS_POS_HUNG_BILLS Set Qt_Free_qty= Nvl(k.I_Qty,1)
										       ,chng_flg=1
				      Where I_Code	   = K.I_Code
					And Itm_Unt	   = K.Itm_Unt
					And Qt_Prm_No	   = I.Quot_No
					And Qt_Prm_Ser	   = I.Quot_Ser
					And Prm_Grp_No	   = I.Prm_Grp_No
					And Bill_Seq	   =P_Bill_Seq
					AND NVL(QT_PRM_RCRD_NO, 0) = I.RCRD_NO
					And Ias_Get_Qt_Prm_Method (I.Quot_Ser)=10;
				    End If;
				 End Loop;
			   End;
	      --##END GRP--------------------
		 ElsIf I.Qt_Prm_Method=11 Then --##new
		      Declare
		       V_I_Price_Grp	 Number;
		       V_I_Price_Grp_Vat Number;
		       V_Dis_Per	 Number;
		       V_CNT_RCRD	 Number;
		       V_Prm_Grp_I_Price Number;
		       V_Prm_Price_Itm	 Number;
		     Begin
			If Nvl(I.Prm_Grp_I_Price,0)>0 Then
		      If Nvl(I.BY_COMP_QTY,0)=1 Then
			   Begin
			     SELECT Sum(I_Price*Nvl(I_Qty,0)),Sum(I_Price_Vat*Nvl(I_Qty,0)),Count(DOC_D_SEQ)
			       Into V_I_Price_Grp,V_I_Price_Grp_Vat,V_CNT_RCRD
				  FROM (
				  SELECT Itm_bill.*,ROW_NUMBER() OVER (ORDER BY DOC_D_SEQ) RN,
				  COUNT(*) OVER () TOTAL_ROWS
				   FROM IAS_POS_HUNG_BILLS Itm_bill
				    WHERE Bill_No =P_Bill_No
				      And Bill_Seq=P_Bill_Seq
				      And Exists ( Select 1 From Ias_Qut_Prm_Grp_Dtl
					      Where I_Code     =Itm_bill.I_Code
						And Itm_Unt    =Itm_bill.Itm_Unt
						And Prm_Grp_No =I.Prm_Grp_No
						And Rownum<=1)
					 )
				  WHERE RN<=TOTAL_ROWS-MOD(TOTAL_ROWS,I.COMP_QTY)
				     ;
			    Exception When Others Then
			       V_I_Price_Grp	:=0;
			       V_I_Price_Grp_Vat:=0;
			    End;
			    V_Prm_Price_Itm:=Nvl(I.Prm_Grp_I_Price,0)/I.COMP_QTY;
			    IF V_CNT_RCRD/I.COMP_QTY>1 Then
				V_Prm_Grp_I_Price:=Nvl(I.Prm_Grp_I_Price,0)* (V_CNT_RCRD/I.COMP_QTY);
			    Else
				V_Prm_Grp_I_Price:=Nvl(I.Prm_Grp_I_Price,0);
			    End If;
			    If Nvl(V_Use_Prc_Incld_Vat,0)=1 And Nvl(V_I_Price_Grp_Vat,0)>0 Then
			      V_I_Price_Grp:=V_I_Price_Grp_Vat;
			    End If;
			    If Nvl(V_I_Price_Grp,0)>0 And Nvl(V_I_Price_Grp,0)>Nvl(V_Prm_Grp_I_Price,0)  Then

			      --V_Dis_Per:=Nvl(V_Prm_Grp_I_Price,0)/V_I_Price_Grp;
			      V_Dis_Per:=(( V_I_Price_Grp-V_Prm_Grp_I_Price)/V_I_Price_Grp)*100;
			      If Nvl(V_Dis_Per,0)>0 Then
				Update Ias_Pos_Hung_Bills Set Dis_Amt_Dtl  =(I_Price*V_Dis_Per)/100, --I_Price-(V_Dis_Per*I_Price),
							    Dis_Amt_Dtl_Vat=(I_Price_vat*V_Dis_Per)/100, --I_Price_Vat-(V_Dis_Per*I_Price_Vat),
							    Dis_Per	   = V_Dis_Per,--((I_Price-(V_Dis_Per*I_Price))/I_Price)*100,
							    Qt_Prm_No	   = I.Quot_No,
							    Qt_Prm_Ser	   = I.Quot_Ser,
							    Qt_Prm_Rcrd_No = I.Rcrd_No,
							    Qt_Prm_Method  = 11,
							    Prm_Grp_No	   = I.Prm_Grp_No,
							    Chng_Flg	   = 1
				Where Bill_No=P_Bill_No
				And Bill_Seq=P_Bill_Seq
				And I_Qty>0
				And I_Price>0
				And  Exists ( Select 1 From Ias_Qut_Prm_Grp_Dtl
				     Where I_Code     =Ias_Pos_Hung_Bills.I_Code
				       And Itm_Unt    =Ias_Pos_Hung_Bills.Itm_Unt
				       And Prm_Grp_No =I.Prm_Grp_No
				       And Rownum<=1)
				And DOC_D_SEQ In (SELECT DOC_D_SEQ
					       FROM (
						    SELECT Itm_bill.*,ROW_NUMBER() OVER (ORDER BY DOC_D_SEQ) RN,
						    COUNT(*) OVER () TOTAL_ROWS FROM IAS_POS_HUNG_BILLS Itm_bill
						      WHERE Bill_No=P_Bill_No
							And Bill_Seq=P_Bill_Seq
							and Exists ( Select 1 From Ias_Qut_Prm_Grp_Dtl
								 Where I_Code	  =Itm_bill.I_Code
								   And Itm_Unt	  =Itm_bill.Itm_Unt
								   And Prm_Grp_No =I.Prm_Grp_No
								    And Rownum<=1)
						     )
						      WHERE RN<=TOTAL_ROWS-MOD(TOTAL_ROWS,I.COMP_QTY)
						    );
			     End If;
			    End If;
		      Else
			    Begin
			      Select Sum(I_Price*Nvl(I_Qty,0)),Sum(I_Price_Vat*Nvl(I_Qty,0)) Into V_I_Price_Grp,V_I_Price_Grp_Vat
			      From Ias_Pos_Hung_Bills
			     Where Bill_No =P_Bill_No
			       And Bill_Seq=P_Bill_Seq
			       And  Exists ( Select 1 From Ias_Qut_Prm_Grp_Dtl
				     Where I_Code     =Ias_Pos_Hung_Bills.I_Code
				       And Itm_Unt    =Ias_Pos_Hung_Bills.Itm_Unt
				       And Prm_Grp_No =I.Prm_Grp_No
				       And Rownum<=1);
			    Exception When Others Then
			      V_I_Price_Grp := 0;
			      V_I_Price_Grp_Vat:=0;
			    End;
			    If Nvl(V_Use_Prc_Incld_Vat,0)=1 And Nvl(V_I_Price_Grp_Vat,0)>0 Then
			      V_I_Price_Grp:=V_I_Price_Grp_Vat;
			    End If;
			    If Nvl(V_I_Price_Grp,0)>0 And Nvl(V_I_Price_Grp,0)>Nvl(I.Prm_Grp_I_Price,0)  Then
			     V_Dis_Per:=Nvl(I.Prm_Grp_I_Price,0)/V_I_Price_Grp;
			     If Nvl(V_Dis_Per,0)>0 Then
			      Update Ias_Pos_Hung_Bills Set Dis_Amt_Dtl    = I_Price-(V_Dis_Per*I_Price),
							    Dis_Amt_Dtl_Vat= I_Price_Vat-(V_Dis_Per*I_Price_Vat),
							    Dis_Per	   = ((I_Price-(V_Dis_Per*I_Price))/I_Price)*100,
							    Qt_Prm_No	   = I.Quot_No,
							    Qt_Prm_Ser	   = I.Quot_Ser,
							    Qt_Prm_Rcrd_No = I.Rcrd_No,
							    Qt_Prm_Method  = 11,
							    Prm_Grp_No	   = I.Prm_Grp_No,
							    Chng_Flg	   = 1
			       Where Bill_No=P_Bill_No
				And Bill_Seq=P_Bill_Seq
				And I_Qty>0
				And I_Price>0
				And  Exists ( Select 1 From Ias_Qut_Prm_Grp_Dtl
				     Where I_Code     =Ias_Pos_Hung_Bills.I_Code
				       And Itm_Unt    =Ias_Pos_Hung_Bills.Itm_Unt
				       And Prm_Grp_No =I.Prm_Grp_No
				       And Rownum<=1);
			     End If;
			    End If;
			End If;-- End BY_COMP_QTY
		       End If;
		    End;
	      End If;
	   End If;
      End Loop;
 Exception when others then
 Null;
 END IAS_Clc_Qtn_Prm_Grp_Prc;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE IAS_Clc_Qtn_Prm_Grp_Rt_Prc(P_Rt_Bill_No    In Ias_Pos_Rt_Bill_Mst.Rt_Bill_No%Type ,
				     P_Bill_Seq      In Ias_pos_rt_bill_dtl_tmp.Bill_Seq%Type,
				     P_Date	     In Date ,
				     P_Bill_Doc_Type In Number ,
				     P_C_Code	     In  Varchar2,
				     P_C_Group_Code  In  Number,
				     P_C_Class	     In  Number,
				     P_C_Degree      In  Number,
				     P_No_Of_Dcml    In Number) IS

  Cursor Qt_Prm Is Select Distinct M.Quot_No,
					M.Quot_Ser,
					M.Qt_Prm_Type,
					M.Qt_Prm_Method,
					M.Qt_Prm_Wc_Type,
					M.Calc_All_Slides,
					D.Qt_I_Code,
					D.Qt_Itm_Unt,
					D.Rcrd_No,
					D.Free_Qty,
					D.Comp_Qty,
					GD.Prm_Grp_No,
					GM.Grnt_Free_Qty_Typ,
					M.By_Comp_Qty,
					NVL(Gm.Chk_All_Itms,0) Chk_All_Itms,
					Decode(M.Qt_Prm_Type,1,0,D.F_Qty) F_Qty,
					Decode(M.Qt_Prm_Type,1,0,D.T_Qty) T_Qty,
					NVL(Decode(M.Qt_Prm_Wc_Type,1,D.W_Code,
								2,D.Whg_Code ,
								3,D.Cntry_No,
								4,D.Prov_No,
								5,D.City_No,
								6,D.R_Code),0) W_Code,
					Trunc(Sum((Nvl(Bd.I_Qty,0)*Nvl(Bd.P_Size,0))/Nvl(GD.P_Size,0))) I_Qty,
					Trunc(Sum(((Nvl(Bd.I_Qty,0)*Nvl(Bd.P_Size,0))/Nvl(GD.P_Size,0)))/D.Comp_Qty) Qt_Qty,
					(Case When M.Qt_Prm_Method=Decode(M.Qt_Prm_Type,1,6) And D.Disc_type=1 Then D.Disc_Amt_Per Else Null End) Dis_Per,
					--(Case When M.Qt_Prm_Method=Decode(M.Qt_Prm_Type,1,6) And D.Disc_type=2 Then D.Disc_Amt_Per Else Null End) Dis_Amt
					(Case When M.Qt_Prm_Method=Decode(M.Qt_Prm_Type,1,6) And D.Disc_type=2 Then D.Disc_Amt_Per/decode(nvl(D.Comp_Qty,0),0,1,D.Comp_Qty) Else Null End) Dis_Amt
				   From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D,Ias_pos_rt_bill_dtl_tmp BD,Ias_Qut_Prm_Grp_Mst GM,Ias_Qut_Prm_Grp_Dtl GD
				  Where M.Quot_Ser	= D.Quot_Ser
				    And Gm.Prm_Grp_No	= Gd.Prm_Grp_No
				    And M.Qt_Prm_Type	In (1,2)
				    And M.Qt_Prm_Method In (6,7)
				    And Bd.I_Code	=GD.I_Code
				    And Bd.Itm_Unt	=GD.Itm_Unt
				    And D.Prm_Grp_No	=GD.Prm_Grp_No
				    And Bd.Bill_Seq	=P_Bill_Seq
				    And Bd.Rt_Bill_No	=P_Rt_Bill_No
				    And Nvl(M.Use_qtn_prm_in_pos_sys_flg,0)=1
				    And Nvl(M.APPROVED,0)= 1
				    And (Case When M.Qt_Prm_Cst_Type=0 Then 1
					      When M.Qt_Prm_Cst_Type=1 And D.C_Code	  = P_C_Code	   Then 1
					      When M.Qt_Prm_Cst_Type=2 And D.C_Group_Code = P_C_Group_Code Then 1
					      When M.Qt_Prm_Cst_Type=3 And D.C_Class	  = P_C_Class	   Then 1
					      When M.Qt_Prm_Cst_Type=4 And D.C_Degree	  = P_C_Degree	   Then 1
					      When M.Qt_Prm_Cst_Type=6 Then 1
					      Else 0 End)=1
				    And (Case When M.Qt_Prm_Wc_Type=0 Then 1
					      When M.Qt_Prm_Wc_Type=1 And D.W_Code   = BD.W_Code Then 1
					      When M.Qt_Prm_Wc_Type=2 And D.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=3 And D.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=4 And D.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=5 And D.City_No  =(Select City_No  From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      When M.Qt_Prm_Wc_Type=6 And D.R_Code   =(Select R_Code   From Warehouse_Details Where W_Code=BD.W_Code And RowNum<=1) Then 1
					      Else 0 End)=1
				    And Nvl(M.Inactive,0)=0
				    And Decode(P_Bill_Doc_Type,4,2,1) = Decode(M.Bill_Doc_Type,Null,Decode(P_Bill_Doc_Type,4,2,1),M.Bill_Doc_Type)
				    And P_date Between M.F_Date And M.T_Date
				    And To_Char(To_Date(P_date),'D') In (M.Fld_Day1,M.Fld_Day2,M.Fld_Day3,M.Fld_Day4,M.Fld_Day5,M.Fld_Day6,M.Fld_Day7)
				    And (CASE WHEN M.F_Time IS NULL  OR M.F_Time IS NULL THEN 1
																			  WHEN M.F_Time <=M.T_Time  AND To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') BETWEEN M.F_Time AND M.T_Time THEN 1
																			  WHEN M.F_Time > M.T_Time  AND (To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') > M.F_Time OR To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') < M.T_Time ) THEN 1
																			  ELSE 0
																		      End)=1
				    Group By M.Quot_No,
					     M.Quot_Ser,
					     M.Qt_Prm_Type,
					     M.Qt_Prm_Method,
					     M.Qt_Prm_Wc_Type,
					     M.Calc_All_Slides,
					     D.Qt_I_Code,
					     D.Qt_Itm_Unt,
					     D.Rcrd_No,
					     D.Free_Qty,
					     D.Comp_Qty,
					     GD.Prm_Grp_No,
					     GM.Grnt_Free_Qty_Typ,
					     M.By_Comp_Qty,
					     NVL(Gm.Chk_All_Itms,0),
					     Decode(M.Qt_Prm_Type,1,0,D.F_Qty),
					     Decode(M.Qt_Prm_Type,1,0,D.T_Qty),
					     D.Disc_type,
					     D.Disc_Amt_Per,
					    Decode(M.Qt_Prm_Wc_Type,1,D.W_Code,
								    2,D.Whg_Code ,
								    3,D.Cntry_No,
								    4,D.Prov_No,
								    5,D.City_No,
								    6,D.R_Code)
				  Having (Case When M.Qt_Prm_Type=1 And Sum((Nvl(Bd.I_Qty,0)*Nvl(Bd.P_Size,0))/Nvl(GD.P_Size,0))>= Decode(Nvl(Gm.CHK_ALL_ITMS,0),0,Nvl(D.Comp_Qty,0),0) Then 1
					       When M.Qt_Prm_Type=2 And Nvl(M.Calc_All_Slides,0)=0 And Sum((Nvl(Bd.I_Qty,0)*Nvl(Bd.P_Size,0))/Nvl(GD.P_Size,0)) Between Nvl(Decode(M.Qt_Prm_Type,1,0,D.F_Qty),0) And Nvl(Decode(M.Qt_Prm_Type,1,0,D.T_Qty),0) Then 1
					       When M.Qt_Prm_Type=2 And Nvl(M.Calc_All_Slides,0)=1 And Sum((Nvl(Bd.I_Qty,0)*Nvl(Bd.P_Size,0))/Nvl(GD.P_Size,0))>=Nvl(Decode(M.Qt_Prm_Type,1,0,D.F_Qty),0) Then 1
					       Else 0 End)=1;

   V_Dis_Per	Number:=0;
   V_Dis_Amt	Number:=0;
   V_Free_Qty	Number:=0;
   V_Cnt	Number:=0;
   V_Rcrd_No	Number:=0;
   V_Qt_I_Code	Ias_Itm_Mst.I_Code%Type;
   V_Qt_Itm_Unt Ias_Itm_Dtl.Itm_Unt%Type;
   V_W_Code	Number;
BEGIN
  -----------------------------------------------------------------------------------------------------------------------------------
  Begin
      Update Ias_pos_rt_bill_dtl_tmp D Set Dis_per=0,Dis_Amt_Dtl=0,Chng_Flg=1
       Where rt_bill_no=p_rt_bill_no
	 And Bill_Seq=P_Bill_Seq
	 And Qt_Prm_Ser Is Not Null
	 And Exists(Select 1 From Ias_Qut_Prm_Mst Where Quot_Ser=D.Qt_Prm_Ser And Qt_Prm_Type In (1,2) And Qt_Prm_Method=6 And RowNum<=1);

      Update Ias_pos_rt_bill_dtl_tmp D Set Qt_Free_Qty=0,Chng_Flg=1
       Where rt_bill_no=p_rt_bill_no
	 And Bill_Seq=P_Bill_Seq
	 AND Qt_Prm_Ser Is Not Null
	 And Exists(Select 1 From Ias_Qut_Prm_Mst Where Quot_Ser=D.Qt_Prm_Ser And Qt_Prm_Type In (1,2) And Qt_Prm_Method=7 And RowNum<=1);

  Exception when others then
    Null;
  End ;
  -----------------------------------------------------------------------------------------------------------------------------------

      For I In Qt_Prm Loop
	   If I.Qt_Prm_Type=1 Then
		  ------------------------------------------------------------------------------------------------------------
		   If I.Chk_All_Itms=1 Then
		    Begin
			Select 1 InTo V_Cnt From (Select I_Code,Itm_Unt,Sum(I_Qty) From ( Select I_Code,Itm_Unt,Nvl(I_Qty,0) I_Qty From IAS_QUT_PRM_GRP_DTL WHERE Prm_Grp_No=I.Prm_Grp_No
											  Union All
											  Select I_Code,Itm_Unt,Sum(Nvl(I_Qty,0))*-1 I_Qty From Ias_pos_rt_bill_dtl_tmp Where Bill_seq=P_bill_seq Group By I_Code,Itm_Unt
											 )
						   Group By I_Code,Itm_Unt
						   Having Sum(I_Qty)>0)
			Where RowNum<=1;
		    Exception When Others Then
			V_Cnt := 0;
		    End;
		   End If;
		    ------------------------------------------------------------------------------------------------------------
		    If ( Nvl(V_Cnt,0)=0 AND Nvl(I.Chk_All_Itms,0)=1) Or Nvl(I.Chk_All_Itms,0)=0 Then
		       Declare
			  Cursor C_Bill Is Select D.I_Code,D.Itm_Unt,D.I_Price,D.Rcrd_No,D.Bill_Seq,D.Rt_Bill_no,D.W_Code From Ias_pos_rt_bill_dtl_tmp D,IAS_QUT_PRM_GRP_DTL G ,Ias_Qut_Prm_Dtl Q
					    Where D.I_Code     = G.I_Code
					      and D.Itm_Unt    = G.Itm_Unt
					      And Q.Quot_Ser   = I.Quot_Ser
					      And Q.Rcrd_No    = I.Rcrd_No
					      And G.Prm_Grp_No = Q.Prm_Grp_No
					      And D.Rt_bill_no =P_Rt_bill_no
					      And D.Bill_Seq=P_Bill_Seq
					      And Decode(I.Qt_Prm_Wc_Type,1,Q.W_Code,
									  2,Q.Whg_Code ,
									  3,Q.Cntry_No,
									  4,Q.Prov_No,
									  5,Q.City_No,
									  6,Q.R_Code,0)=Nvl(I.W_Code,0)
					      Order By D.Rcrd_No;
			  V_Qt_Iqty Number:=0;
			Begin
			  For J In C_Bill Loop
			     IF I.Qt_Prm_Method<>7 Then
				    V_Dis_Per := 0;
				    V_Dis_Amt := 0;
				    If Nvl(I.Dis_Per,0)>0 Then
				      V_Dis_Per := I.Dis_Per;
				      V_Dis_Amt := (nvl(J.I_Price,0)*nvl(I.Dis_Per,0))/100;
				    ElsIf Nvl(I.Dis_Amt,0)>0 And Nvl(J.I_Price,0)>0 Then
				      V_dis_per := (I.Dis_amt/J.I_price)*100;
				      V_Dis_Amt := I.Dis_Amt;
				    End If;
			       Update Ias_pos_rt_bill_dtl_tmp Set Dis_Amt_Dtl	 = ((I.I_Qty-Mod(I.I_Qty,I.Comp_Qty))*(V_Dis_Per/100)*J.I_Price)/I.I_Qty,
							    Dis_per	   = ((((I.I_Qty-Mod(I.I_Qty,I.Comp_Qty))*(V_Dis_Per/100)*J.I_Price)/I.I_Qty)/J.I_Price)*100,
							    Qt_Prm_No	   = I.Quot_No,
							    Qt_Prm_Ser	   = I.Quot_Ser,
							    Qt_Prm_Rcrd_No = I.Rcrd_No,
							    Chng_Flg	   = 1
			     Where I_Code	= J.I_Code
			       And Itm_Unt	= J.Itm_Unt
			       And Rcrd_No	= J.Rcrd_No
			       And Rt_bill_no	= J.Rt_bill_no
			       And Bill_Seq	= J.Bill_Seq
			       And I.I_Qty>0
			       And J.I_Price>0;
			    Else
				  V_Qt_I_Code  := I.Qt_I_Code;
				  V_Qt_Itm_Unt := I.Qt_Itm_Unt;
				  Get_Prm_Grp_Icode ( P_Prm_Grp_No	  => I.Prm_Grp_No,
						      P_Grnt_Free_Qty_Typ => I.Grnt_Free_Qty_Typ,
						      P_Qt_I_Code	  => V_Qt_I_Code,
						      P_Qt_Itm_Unt	  => V_Qt_Itm_Unt);
				  Begin
				    Select Max(Rcrd_No) Into V_Rcrd_No From Ias_pos_rt_bill_dtl_tmp
				    Where Rt_bill_no=j.Rt_bill_no
				     And Bill_Seq=j.Bill_Seq;
				  Exception When Others Then
				      V_Rcrd_No:=1;
				  End;

				   Begin
				    Select 1 InTo V_Cnt
				      From Ias_pos_rt_bill_dtl_tmp
				     Where I_Code		 = V_Qt_I_Code
				       And Itm_Unt		 = V_Qt_Itm_Unt
				       And Nvl(Qt_Prm_No,0)	 = I.Quot_No
				       And Nvl(Qt_Prm_Ser,0)	 = I.Quot_Ser
				       And Nvl(Qt_Prm_Rcrd_No,0) = I.Rcrd_No
				       And Ias_Get_Qt_Prm_Method (Nvl(I.Quot_Ser,0))=7
				       And Rt_bill_no =j.Rt_bill_no
				       And Bill_Seq=j.Bill_Seq
				       And RowNum<=1;
				  Exception When Others Then
				    V_Cnt := 0;
				  End;

				  If Nvl(V_Cnt,0)=0 And (I.Qt_Qty*I.Free_Qty)>0 And V_Qt_I_Code Is Not Null And V_Qt_Itm_Unt Is Not Null  Then
					  INSERT INTO Ias_pos_rt_bill_dtl_tmp
							(Rt_bill_no,
							 i_code,
							 itm_unt,
							 p_size,
							 i_qty,
							 Qt_Free_qty,
							 i_price,
							 w_code,
							 dis_per,
							 dis_amt_dtl,
							 rcrd_no,
							 bill_seq,
							 qt_prm_no,
							 qt_prm_ser,
							 qt_prm_rcrd_no,
							 Prm_Grp_No,
							 chng_flg,
							 Cmp_no,
							 Brn_no
							)
						 VALUES (j.rt_bill_no,
							 V_Qt_I_Code,
							 V_Qt_Itm_Unt,
							 Ias_Itm_Pkg.Get_Icode_Size_Unit ( P_I_Code => V_Qt_I_Code,P_Itm_Unt => V_Qt_Itm_Unt),
							 null,
							 I.Qt_Qty*I.Free_Qty,
							 null,
							 J.W_Code,
							 0,
							 0,
							 V_Rcrd_No,
							 j.bill_seq,
							 I.Quot_No,
							 I.Quot_Ser,
							 I.Rcrd_No,
							 I.Prm_Grp_No,
							 1,
							 1,
							 1
							);
				  Else
				       Update Ias_pos_rt_bill_dtl_tmp Set Qt_Free_qty= I.Qt_Qty*I.Free_Qty,chng_flg=1
					Where I_Code	     = V_Qt_I_Code
					  And Itm_Unt	     = V_Qt_Itm_Unt
					  And Nvl(Qt_Prm_No,0)	    = I.Quot_No
					  And Nvl(Qt_Prm_Ser,0)     = I.Quot_Ser
					  And Nvl(Qt_Prm_Rcrd_No,0) = I.Rcrd_No
					  And Ias_Get_Qt_Prm_Method (Nvl(I.Quot_Ser,0))=7
					  And rt_bill_no =j.rt_bill_no
					  And Bill_Seq=j.Bill_Seq;
				  End If;
			     End If;
			   End Loop;
			End;
		    End If;
		    ------------------------------------------------------------------------------------------------------------
	   ElsIf I.Qt_Prm_Type=2 Then
		   ------------------------------------------------------------------------------------------------------------
		    If I.Chk_All_Itms=1 Then
			Begin
			    Select 1 InTo V_Cnt From (Select I_Code,Itm_Unt,Sum(I_Qty) From ( Select I_Code,Itm_Unt,Nvl(I_Qty,0) I_Qty From IAS_QUT_PRM_GRP_DTL WHERE Prm_Grp_No=I.Prm_Grp_No
											      Union All
											      Select I_Code,Itm_Unt,Sum(Nvl(I_Qty,0))*-1 I_Qty From Ias_pos_rt_bill_dtl_tmp Where Bill_seq=P_bill_seq Group By I_Code,Itm_Unt
											     )
						       Group By I_Code,Itm_Unt
						       Having Sum(I_Qty)>0)
			    Where RowNum<=1;
			Exception When Others Then
			    V_Cnt := 0;
			End;
		    End If;
		    ------------------------------------------------------------------------------------------------------------
		    If ( Nvl(V_Cnt,0)=0 AND Nvl(I.Chk_All_Itms,0) =1 ) Or Nvl(I.Chk_All_Itms,0)=0 Then
		      If I.Qt_Prm_Method<>7 Then
			If I.Calc_All_Slides=1 And Nvl(I.I_Qty,0)>0 Then
			   Select SUM(Case When Disc_type=1 And D.T_Qty<=I.I_Qty Then (((D.T_Qty-D.F_Qty+1)*(D.Disc_Amt_Per/100))/I.I_Qty)
					   When Disc_type=1 And D.T_Qty>I.I_Qty Then (((I.I_Qty-D.F_Qty+1)*(D.Disc_Amt_Per/100))/I.I_Qty)
				      End)*100,
				     SUM(Case When Disc_type=2 And D.T_Qty<=I.I_Qty Then (((D.T_Qty-D.F_Qty+1)*D.Disc_Amt_Per)/I.I_Qty)
					      When Disc_type=2 And D.T_Qty>I.I_Qty  Then (((I.I_Qty-D.F_Qty+1)*D.Disc_Amt_Per)/I.I_Qty)
				      End)
			       InTo V_Dis_Per,
				    V_Dis_Amt
			      From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D
			     Where M.Quot_Ser	= D.Quot_Ser
			       And M.Quot_Ser	= I.Quot_Ser
			       And D.Prm_Grp_No = I.Prm_Grp_No
			       And D.F_Qty<=I.I_Qty;
			ElsIf I.Calc_All_Slides=0 Then

			   Begin
			       Select Decode(Disc_type,1,Disc_Amt_Per) ,
				      Decode(Disc_type,2,Disc_Amt_Per)
				   InTo V_Dis_Per,
					V_Dis_Amt
				  From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D
				 Where M.Quot_Ser   = D.Quot_Ser
				   And M.Quot_Ser   = I.Quot_Ser
				   And D.Prm_Grp_No = I.Prm_Grp_No
				   And I.I_Qty Between D.F_Qty And D.T_Qty
				   And RowNum<=1;
			     Exception when others then
			       V_Dis_Per :=0;
			       V_Dis_Amt :=0;
			     End;
		      End If;


		     Update Ias_pos_rt_bill_dtl_tmp a Set Dis_Amt_Dtl	 =  (Case When Nvl(V_Dis_Per,0)>0 Then	(Decode(nvl(I_Price_vat,0),0,nvl(I_Price,0),nvl(I_Price_vat,0))*nvl(V_Dis_Per,0))/100
									      When Nvl(V_Dis_Amt,0)>0 And Nvl(I_Price,0)>0 Then  V_Dis_Amt
									      Else 0 End),
						       Dis_per	      = (Case When Nvl(V_Dis_Per,0)>0 Then  V_Dis_Per
									      When Nvl(V_Dis_Amt,0)>0 And Nvl(I_Price,0)>0 Then  (V_Dis_Amt/Decode(nvl(I_Price_vat,0),0,nvl(I_Price,0),nvl(I_Price_vat,0)))*100
									      Else 0 End),
						       Qt_Prm_No      = I.Quot_No,
						       Qt_Prm_Ser     = I.Quot_Ser,
						       Qt_Prm_Rcrd_No = I.Rcrd_No,
						       Chng_Flg       = 1
		     Where rt_bill_no=P_rt_bill_no
		      And Bill_Seq=P_Bill_Seq
		      And Exists ( Select 1 From IAS_QUT_PRM_GRP_DTL
				     Where I_Code     = a.I_Code
				       And Itm_Unt    = a.Itm_Unt
				       And Prm_Grp_No = I.Prm_Grp_No
				       And RowNum<=1);


		 ElsIf I.Qt_Prm_Method=7 Then
		 Begin
		  Select  TRUNC(SUM(Case When D.T_Qty<=I.I_Qty And I.Calc_All_Slides=1 Then TRUNC((T_Qty-F_Qty+1)/Decode(I.By_Comp_Qty,1,Comp_Qty,(T_Qty-F_Qty+1)))*Free_Qty
					 When D.T_Qty>I.I_Qty  And I.Calc_All_Slides=1 Then TRUNC((I.I_Qty-F_Qty+1)/Decode(I.By_Comp_Qty,1,Comp_Qty,(T_Qty-F_Qty+1)))*Free_Qty
					 When I.Calc_All_Slides=0 And (I.I_Qty Between D.F_Qty And D.T_Qty) And I.Calc_All_Slides=0 Then TRUNC(TRUNC(I.I_Qty/Decode(I.By_Comp_Qty,1,Nvl(Comp_Qty,1),I.I_Qty))*Free_Qty)
			   End))
		   InTo V_Free_Qty
		   From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D
		  Where M.Quot_Ser	= D.Quot_Ser
		    And M.Quot_Ser	= I.Quot_Ser
		    And M.Qt_Prm_Method = 7
		    And D.Prm_Grp_No	= I.Prm_Grp_No
		    And D.F_Qty<=I.I_Qty;
		 Exception When Others Then
		    V_Free_Qty := 0;
		  End;
		  V_Qt_I_Code  := I.Qt_I_Code;
		  V_Qt_Itm_Unt := I.Qt_Itm_Unt;
		  Get_Prm_Grp_Icode ( P_Prm_Grp_No	  => I.Prm_Grp_No,
				      P_Grnt_Free_Qty_Typ => I.Grnt_Free_Qty_Typ,
				      P_Qt_I_Code	  => V_Qt_I_Code,
				      P_Qt_Itm_Unt	  => V_Qt_Itm_Unt);
		  Begin
			Select W_Code InTo V_W_Code
			  From Ias_pos_rt_bill_dtl_tmp
			 Where W_Code Is Not Null
			   And RowNum<=1;
		  Exception When Others Then
		    V_Cnt := 0;
		  End;

		  Begin
			Select 1 InTo V_Cnt
			  From Ias_pos_rt_bill_dtl_tmp
			 Where I_Code		     = V_Qt_I_Code
			   And Itm_Unt		     = V_Qt_Itm_Unt
			   And Nvl(Qt_Prm_No,0)      = I.Quot_No
			   And Nvl(Qt_Prm_Ser,0)     = I.Quot_Ser
			   And Nvl(Prm_Grp_No,0)     = I.Prm_Grp_No
			   And Ias_Get_Qt_Prm_Method (Nvl(I.Quot_Ser,0))=7
			   And rt_bill_no=P_rt_bill_no
			   And Bill_Seq=P_Bill_Seq
			   And RowNum<=1;
		  Exception When Others Then
		    V_Cnt := 0;
		  End;

		  If Nvl(V_Cnt,0)=0 And Nvl(V_Free_Qty,0)>0 And V_Qt_I_Code Is Not Null And V_Qt_Itm_Unt Is Not Null  Then
			  INSERT INTO Ias_pos_rt_bill_dtl_tmp
					(Rt_Bill_No,
					 i_code,
					 itm_unt,
					 p_size,
					 i_qty,
					 Qt_Free_qty,
					 i_price,
					 w_code,
					 dis_per,
					 dis_amt_dtl,
					 rcrd_no,
					 Bill_Seq,
					 qt_prm_no,
					 qt_prm_ser,
					 qt_prm_rcrd_no,
					 Prm_Grp_No,
					 chng_flg,
					 Cmp_no,
					 Brn_no
					)
				 VALUES (P_Rt_Bill_no,
					 V_Qt_I_Code,
					 V_Qt_Itm_Unt,
					 Ias_Itm_Pkg.Get_Icode_Size_Unit ( P_I_Code => V_Qt_I_Code,P_Itm_Unt => V_Qt_Itm_Unt),
					 null,
					 V_Free_qty,
					 null,
					 null,
					 0,
					 0,
					 V_Rcrd_No,
					 P_Bill_Seq,--Ias_Doc_Seq_Othr.Nextval,
					 I.Quot_No,
					 I.Quot_Ser,
					 I.Rcrd_No,
					 I.Prm_Grp_No,
					 1,
					 1,
					 1
					);
		  Else
		       Update Ias_pos_rt_bill_dtl_tmp Set Qt_Free_qty= V_Free_Qty,chng_flg=1
			Where I_Code	     = V_Qt_I_Code
			  And Itm_Unt	     = V_Qt_Itm_Unt
			  And Qt_Prm_No      = I.Quot_No
			  And Qt_Prm_Ser     = I.Quot_Ser
			  And Prm_Grp_No     = I.Prm_Grp_No
			  And Bill_Seq	     = P_Bill_Seq
			  And Ias_Get_Qt_Prm_Method (I.Quot_Ser)=7;
		  End If;
	      End If;
	     End If;
	   End If;
      End Loop;
 Exception when others then
 Null;
END IAS_Clc_Qtn_Prm_Grp_Rt_Prc;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE  Get_Prm_Grp_Icode ( P_Prm_Grp_No	   In Ias_Qut_Prm_Grp_Mst.Prm_Grp_No%Type,
			       P_Grnt_Free_Qty_Typ In Ias_Qut_Prm_Grp_Mst.Grnt_Free_Qty_Typ%Type,
			       P_Qt_I_Code	   In Out Ias_Qut_Prm_Dtl.Qt_I_Code%Type,
			       P_Qt_Itm_Unt	   In Out Ias_Qut_Prm_Dtl.Qt_Itm_Unt%Type) IS
BEGIN
  If P_Grnt_Free_Qty_Typ=2 Then
    Select I_Code,Itm_Unt InTo P_Qt_I_Code,P_Qt_Itm_Unt
    From(
    Select B.I_Code,B.Itm_Unt,Sum(Nvl(B.I_Qty,0)*Nvl(B.I_Price,0)) Total From Ias_Pos_Hung_Bills B,Ias_Qut_Prm_Grp_Dtl G
    Where B.I_Code=G.I_Code
      And G.Prm_Grp_No = P_Prm_Grp_No
    Group By B.I_Code,B.Itm_Unt
    Order By Total Desc)
    Where RowNum<=1;
  ElsIf P_Grnt_Free_Qty_Typ=3 Then
    Select I_Code,Itm_Unt InTo P_Qt_I_Code,P_Qt_Itm_Unt
    From(
    Select B.I_Code,B.Itm_Unt,Sum(Nvl(B.I_Qty,0)*Nvl(B.I_Price,0)) Total From Ias_Pos_Hung_Bills B,Ias_Qut_Prm_Grp_Dtl G
    Where B.I_Code=G.I_Code
      And G.Prm_Grp_No = P_Prm_Grp_No
    Group By B.I_Code,B.Itm_Unt
    Order By Total Asc)
    Where RowNum<=1;
  ElsIf P_Grnt_Free_Qty_Typ=4 Then
    Select I_Code,Itm_Unt InTo P_Qt_I_Code,P_Qt_Itm_Unt
    From(
    Select B.I_Code,B.Itm_Unt From Ias_Pos_Hung_Bills B,Ias_Qut_Prm_Grp_Dtl G
    Where B.I_Code=G.I_Code
      And G.Prm_Grp_No = P_Prm_Grp_No
    Order By B.Rcrd_No Asc
    )
    Where RowNum<=1;
  End If;

Exception When Others Then
  Null;
END Get_Prm_Grp_Icode;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE Get_Qt_Prm_Bill_Grp_Prc(P_BILL_NO   In Number,
			    P_BILL_SEQ	      In  Number,
			    P_Wcode	      In  Number,
			    P_Icode	      In  Varchar2,
			    P_Qt_Ser	      Out Number,
			    P_Qt_No	      Out Number,
			    P_Qt_Prm_Type     Out Number,
			    P_Qt_Prm_Method   Out Number,
			    P_Qt_Prm_Itm_Type Out Number,
			    P_Dis_Per	      Out Number,
			    P_Dis_Amt	      Out Number)  Is
 V_Cnt	Number;
 V_price_tot_by_grp Number;
 V_Dis_Per	    Number;
 V_I_PRICE	    Number;
 V_Use_Price_Include_Vat Number;
BEGIN
       Begin
	  Select Use_Price_Include_Vat Into V_Use_Price_Include_Vat From Ias_Para_Gen;
       Exception When Others Then
	 V_Use_Price_Include_Vat:=0;
       End;
       Begin
	     Select  Quot_ser,Quot_no,Qt_prm_type,Qt_prm_method,Qt_prm_itm_type,Disc_Amt_Per,Disc_Amt_Amt,price_tot_by_grp
	      InTo P_Qt_Ser,P_Qt_No,P_Qt_prm_type,P_Qt_prm_method,P_Qt_prm_itm_type,
		   P_Dis_Per,
		   P_Dis_Amt,
		   V_price_tot_by_grp
	      From(
	       Select  M.Quot_ser,M.Quot_no,M.Qt_prm_type,m.Qt_prm_method,M.Qt_prm_itm_type,
		       Decode(D.Disc_type,1,d.Disc_Amt_Per) Disc_Amt_Per,
		       Decode(D.Disc_type,2,d.Disc_Amt_Per) Disc_Amt_Amt,
		       Sum(Decode(V_Use_Price_Include_Vat,1,bill.i_price_vat,bill.i_price)*bill.i_qty)	price_tot_by_grp
		  From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D,Ias_Itm_Mst Mi,Ias_Pos_Hung_Bills bill
		 Where m.Quot_Ser = d.Quot_Ser
		   --And Mi.I_Code  =P_Icode
		   And Mi.I_Code  =Bill.I_Code
		   And Bill.BILL_NO=P_BILL_NO
		   And Bill.Bill_seq=P_BILL_SEQ
		   And m.Qt_Prm_Type=3
		   And m.Qt_Prm_Method=1
		   And to_Date(sysdate,'DD/MM/YYYY') between to_Date(f_date,'DD/MM/YYYY') and to_Date(t_date,'DD/MM/YYYY')
		   And Nvl(m.Use_qtn_prm_in_pos_sys_flg,0)=1
		   And Nvl(m.Inactive,0)=0
		   And Nvl(m.APPROVED,0)=1
		   And (Case When M.Qt_Prm_Itm_Type=1 And  D.G_Code=(select g_code from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=2 And D.Mng_Code=(select Mng_Code from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=3 And D.Subg_Code=(select Subg_Code from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=4 And D.Assistant_No=(select Assistant_No from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=5 And D.Detail_No=(select Detail_No from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=6 And D.Group_No=(select Group_No from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=7 And D.Item_Type=(select Item_Type from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=8 And D.Grp_Class_Code=(select Grp_Class_Code from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=9 And Exists(Select 1 From Ias_Qut_Prm_Grp_Dtl Where Prm_Grp_No=D.Prm_Grp_No And I_Code=P_Icode And RowNum<=1) Then 1
			     Else 0 End)=1
		   And (Case When M.Qt_Prm_Itm_Type=1 And D.G_Code=Mi.G_Code Then 1
			     When M.Qt_Prm_Itm_Type=2 And D.Mng_Code=Mi.Mng_Code Then 1
			     When M.Qt_Prm_Itm_Type=3 And D.Subg_Code=Mi.Subg_Code Then 1
			     When M.Qt_Prm_Itm_Type=4 And D.Assistant_No=Mi.Assistant_No Then 1
			     When M.Qt_Prm_Itm_Type=5 And D.Detail_No=Mi.Detail_No Then 1
			     When M.Qt_Prm_Itm_Type=6 And D.Group_No=Mi.Group_No Then 1
			     When M.Qt_Prm_Itm_Type=7 And D.Item_Type=Mi.Item_Type Then 1
			     When M.Qt_Prm_Itm_Type=8 And D.Grp_Class_Code=Mi.Grp_Class_Code Then 1
			     When M.Qt_Prm_Itm_Type=9 And Exists(Select 1 From Ias_Qut_Prm_Grp_Dtl Where Prm_Grp_No=D.Prm_Grp_No And I_Code=P_Icode And RowNum<=1) Then 1
			     Else 0 End)=1
		   And (Case  When M.Qt_Prm_Wc_Type=0 Then 1
			      When M.Qt_Prm_Wc_Type=1 And D.W_Code   = P_Wcode Then 1
			      When M.Qt_Prm_Wc_Type=2 And D.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			      When M.Qt_Prm_Wc_Type=3 And D.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			      When M.Qt_Prm_Wc_Type=4 And D.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			      When M.Qt_Prm_Wc_Type=5 And D.City_No  =(Select City_No  From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
			      When M.Qt_Prm_Wc_Type=6 And D.R_Code   =(Select R_Code   From Warehouse_Details Where W_Code=P_Wcode And RowNum<=1) Then 1
		       Else 0 End)=1
		 /*  And (Case	When M.Qt_Prm_Cst_Type=0 Then 1
			      When M.Qt_Prm_Cst_Type=1 And D.C_Code	  = P_C_Code	   Then 1
			      When M.Qt_Prm_Cst_Type=2 And D.C_Group_Code = P_C_Group_Code Then 1
			      When M.Qt_Prm_Cst_Type=3 And D.C_Class	  = P_C_Class	   Then 1
			      When M.Qt_Prm_Cst_Type=4 And D.C_Degree	  = P_C_Degree	   Then 1
			      When M.Qt_Prm_Cst_Type=7 And D.Cust_Grp_Code = P_Cst_Grp_Csh     Then 1
			      When M.Qt_Prm_Cst_Type=8 And D.C_Code_Csh     = P_c_code_csh     Then 1
			      Else 0 End)=1*/
		 Group by  D.F_amt , D.T_amt, D.Disc_type,1,d.Disc_Amt_Per ,M.Quot_ser,M.Quot_no,M.Qt_prm_type,m.Qt_prm_method,M.Qt_prm_itm_type
		 Having Sum(Bill.I_price*Bill.I_qty) Between D.F_amt And D.T_amt
		 )
		 WHERE Rownum<=1;
		 If Nvl(V_price_tot_by_grp,0)>0 AND Nvl(P_Dis_Amt,0)>0 Then
		    Begin
		      Select Decode(V_Use_Price_Include_Vat,1,I_Price_Vat,I_Price) Into V_I_Price From Ias_Pos_Hung_Bills
		       WHERE I_CODE  =P_Icode
			 And BILL_NO =P_BILL_NO
			 And Bill_seq=P_BILL_SEQ
			 And Rownum<=1;
		    Exception When Others Then
		      V_I_PRICE:=0;
		    End;
		    IF V_I_PRICE>0 THEN
			V_Dis_Per:=(V_I_PRICE/V_price_tot_by_grp)*100;
			P_Dis_Amt:=(V_Dis_Per*P_Dis_Amt)/100;
		    END IF;
		 End If;
		 If nvl(P_Dis_Per,0)>0 Or Nvl(P_Dis_Amt,0)>0  Then
		 Begin
		   Select count(1) into v_cnt
		      From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D,Ias_Itm_Mst Mi,Ias_Pos_Hung_Bills bill
		 Where m.Quot_Ser = d.Quot_Ser
		   --And Mi.I_Code  =P_Icode
		   And Mi.I_Code  =Bill.I_Code
		   And Bill.BILL_NO=P_BILL_NO
		   And Bill.Bill_seq=P_BILL_SEQ
		   And m.Qt_Prm_Type=3
		   And m.Qt_Prm_Method=1
		   And to_Date(sysdate,'DD/MM/YYYY') between to_Date(f_date,'DD/MM/YYYY') and to_Date(t_date,'DD/MM/YYYY')
		   And Nvl(m.Use_qtn_prm_in_pos_sys_flg,0)=1
		   And Nvl(m.Inactive,0)=0
		  And (Case When M.Qt_Prm_Itm_Type=1 And  D.G_Code=(select g_code from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=2 And D.Mng_Code=(select Mng_Code from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=3 And D.Subg_Code=(select Subg_Code from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=4 And D.Assistant_No=(select Assistant_No from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=5 And D.Detail_No=(select Detail_No from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=6 And D.Group_No=(select Group_No from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=7 And D.Item_Type=(select Item_Type from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=8 And D.Grp_Class_Code=(select Grp_Class_Code from Ias_Itm_Mst where i_code=P_Icode) Then 1
			     When M.Qt_Prm_Itm_Type=9 And Exists(Select 1 From Ias_Qut_Prm_Grp_Dtl Where Prm_Grp_No=D.Prm_Grp_No And I_Code=P_Icode And RowNum<=1) Then 1
			     Else 0 End)=1
		     And (Case When M.Qt_Prm_Itm_Type=1 And D.G_Code=Mi.G_Code Then 1
			     When M.Qt_Prm_Itm_Type=2 And D.Mng_Code=Mi.Mng_Code Then 1
			     When M.Qt_Prm_Itm_Type=3 And D.Subg_Code=Mi.Subg_Code Then 1
			     When M.Qt_Prm_Itm_Type=4 And D.Assistant_No=Mi.Assistant_No Then 1
			     When M.Qt_Prm_Itm_Type=5 And D.Detail_No=Mi.Detail_No Then 1
			     When M.Qt_Prm_Itm_Type=6 And D.Group_No=Mi.Group_No Then 1
			     When M.Qt_Prm_Itm_Type=7 And D.Item_Type=Mi.Item_Type Then 1
			     When M.Qt_Prm_Itm_Type=8 And D.Grp_Class_Code=Mi.Grp_Class_Code Then 1
			     When M.Qt_Prm_Itm_Type=9 And Exists(Select 1 From Ias_Qut_Prm_Grp_Dtl Where Prm_Grp_No=D.Prm_Grp_No And I_Code=P_Icode And RowNum<=1) Then 1
			     Else 0 End)=1
		    Having Sum(Bill.I_price*Bill.I_qty) Between D.F_amt And D.T_amt
		    GROUP BY D.F_amt, D.T_amt;
		 EXCEPTION WHEN OTHERS THEN
		    P_Dis_Per:=0;
		    P_Dis_Amt:=0;
		    v_cnt:=0;
		END;
		If Nvl(V_Cnt,0)=0 then
		    P_Dis_Per:=0;
		    P_Dis_Amt:=0;
		    P_Qt_Ser:='';
		    P_Qt_No:='';
		    P_Qt_prm_type:='';
		    P_Qt_prm_method:='';
		    P_Qt_prm_itm_type:='';
		End If;
	     End if;
       EXCEPTION WHEN OTHERS THEN
	   P_Dis_Per:=0;
	   P_Dis_Amt:=0;
       END;
       --End If;
EXCEPTION WHEN OTHERS THEN
    P_Dis_Per:=0;
    P_Dis_Amt:=0;
End Get_Qt_Prm_Bill_Grp_Prc;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE Get_Qt_Prm_Data_Prc(P_Icode	      In  Varchar2,
			      P_ItmUnt	      In  Varchar2,
			      P_Wcode	      In  Number,
			      P_C_Code	      In  Varchar2,
			      P_C_Group_Code  In  Number,
			      P_C_Class       In  Number,
			      P_C_Degree      In  Number,
			      P_C_Code_Csh    In  Varchar2,
			      P_Cst_Grp_Csh   In  Number,
			      P_Qt_Prm_Ser    Out Number) Is
Begin
 If P_C_Code Is Not Null Then
	 Select M.Quot_ser
	       Into P_qt_prm_ser
	       From Ias_qut_prm_mst M,Ias_qut_prm_dtl D
	  Where M.QUOT_SER=D.QUOT_SER and M.Qt_Prm_Cst_Type IN(1,2,3,4,5,6,7,8) And
	  Nvl( M.Use_qtn_prm_in_pos_sys_flg,0)=1 And Nvl( M.INACTIVE,0)=0 And Nvl(M.APPROVED,0)= 1
	   And to_Date(sysdate,'DD/MM/YYYY') between to_Date(f_date,'DD/MM/YYYY') and to_Date(t_date,'DD/MM/YYYY')
	   And d.i_code=P_Icode
	   And (Case
		  When M.Qt_Prm_Cst_Type=1 And D.C_Code       = P_C_Code       Then 1
		  When M.Qt_Prm_Cst_Type=2 And D.C_Group_Code = P_C_Group_Code Then 1
		  When M.Qt_Prm_Cst_Type=3 And D.C_Class      = P_C_Class      Then 1
		  When M.Qt_Prm_Cst_Type=4 And D.C_Degree     = P_C_Degree     Then 1
		  When M.Qt_Prm_Cst_Type=5 And P_c_code_csh Is Not Null Then 1
		  --When M.Qt_Prm_Cst_Type=6  Then 1
		  When M.Qt_Prm_Cst_Type=7 And D.Cust_Grp_Code= P_Cst_Grp_Csh  Then 1
		  When M.Qt_Prm_Cst_Type=8 And D.C_Code_Csh   = P_c_code_csh   Then 1
		  Else 0 End)=1
	   And RowNum<=1;
  Else
     P_QT_PRM_SER:='';
  End If;
 EXCEPTION WHEN OTHERS THEN
   P_QT_PRM_SER:='';
End Get_Qt_Prm_Data_Prc;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION  DYN_QT_PRM_DUP_IC_VW (   P_date		 In  Date,
				   P_Icode		 In  Varchar2,
				   P_Itm_Unt		 In  Varchar2,
				   P_Wcode		 In  Number,
				   P_Batch_No		 In  Varchar2,
				   P_Exp_Date		 In  Date,
				   P_Bill_Doc_Type	 In  Number ,
				   P_C_Code		 In  Varchar2,
				   P_C_Code_Csh 	 In  Varchar2,
				   P_Chk_Qt_No		 In  Number Default Null ,
				   P_Chk_Qt_Ser 	 In  Number Default Null ,
				   P_Sys_Typ		 In  Number	     , --1- ONYX PRO 2- POS SYSTME 3- DTS SYSTEM 4- SHO SYSTEM
				   P_Lang_No		 In  Number Default 1)
				   RETURN TP_DYN_TBL PIPELINED	 IS
   V_C_GROUP_CODE  CUSTOMER.C_GROUP_CODE%TYPE;
   V_C_CLASS	   CUSTOMER.C_CLASS%TYPE;
   V_C_DEGREE	   CUSTOMER.C_DEGREE%TYPE;
   V_Cst_Grp_Csh   IAS_CASH_CUSTMR.Cust_Grp_Code%Type;
   V_DYN_RFC	   TP_DYN_RFC;
   G_DYN_QRY	   VARCHAR2(32767);
 Begin
    If P_C_Code Is Not Null Then
	Begin
	     Select C_Group_Code,C_Class,C_Degree InTo V_C_Group_Code,V_C_Class,V_C_Degree From Customer Where C_Code= P_C_Code And RowNUm<=1;
	Exception WHen Others Then
	     V_C_Group_Code := Null;
	     V_C_Class	    := Null;
	     V_C_Degree     := Null;
	End;
    End If;

    If P_C_Code_Csh IS Not Null Then
       Begin
	  Select Cust_Grp_Code InTo V_Cst_Grp_Csh From IAS_CASH_CUSTMR Where CUST_CODE= P_C_Code_Csh And RowNUm<=1;
       Exception WHen Others Then
	  V_Cst_Grp_Csh := Null;
       End;
    End If;

    G_DYN_QRY:='Select M.Quot_no,M.Quot_ser,M.F_date,M.T_date,M.Qt_prm_type,
		       Ias_gen_pkg.Get_flg_nm (P_flg_code => ''QT_PRM_TYP'',P_flg_value => M.Qt_prm_type,P_lng_no => '||P_Lang_No||') Qt_prm_type_nm,
		       M.Qt_prm_method,
		       Ias_gen_pkg.Get_flg_nm (P_flg_code => ''QT_PRM_METHOD'',P_flg_value => M.Qt_prm_method,P_lng_no => '||P_Lang_No||') Qt_prm_method_nm,
		       M.A_desc
	From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D,Ias_Qut_Prm_Grp_Dtl G
       Where M.Quot_Ser = D.Quot_Ser
	 And M.Quot_Ser = Decode('||Nvl(P_Chk_Qt_Ser,0)||',0,M.Quot_Ser,'||Nvl(P_Chk_Qt_Ser,0)||')
	 And M.Qt_prm_type In (1,2)
	 And D.Prm_grp_no = G.Prm_grp_no(+)
	 And Nvl(D.I_code,G.I_code)='''||P_Icode||'''
	 And Nvl(D.Itm_unt,G.Itm_unt)='''||P_Itm_Unt||'''
	 And (Case
		  When M.Qt_Prm_Wc_Type=0 Then 1
		  When M.Qt_Prm_Wc_Type=1 And D.W_Code	 = '||P_Wcode||' Then 1
		  When M.Qt_Prm_Wc_Type=2 And D.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code='||P_Wcode||' And RowNum<=1) Then 1
		  When M.Qt_Prm_Wc_Type=3 And D.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code='||P_Wcode||' And RowNum<=1) Then 1
		  When M.Qt_Prm_Wc_Type=4 And D.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code='||P_Wcode||' And RowNum<=1) Then 1
		  When M.Qt_Prm_Wc_Type=5 And D.City_No  =(Select City_No  From Warehouse_Details Where W_Code='||P_Wcode||' And RowNum<=1) Then 1
		  When M.Qt_Prm_Wc_Type=6 And D.R_Code	 =(Select R_Code   From Warehouse_Details Where W_Code='||P_Wcode||' And RowNum<=1) Then 1
		  Else 0 End)=1
	 And (Case
		  When M.Qt_Prm_Cst_Type=0 Then 1
		  When M.Qt_Prm_Cst_Type=1 And D.C_Code       = '''||P_C_Code||'''	 Then 1
		  When M.Qt_Prm_Cst_Type=2 And D.C_Group_Code = '''||V_C_Group_Code||''' Then 1
		  When M.Qt_Prm_Cst_Type=3 And D.C_Class      = '||NVL(V_C_Class,0)||'	    Then 1
		  When M.Qt_Prm_Cst_Type=4 And D.C_Degree     = '||NVL(V_C_Degree,0)||'     Then 1
		  When M.Qt_Prm_Cst_Type=5 And '''||P_c_code_csh||''' Is Not Null Then 1
		  When M.Qt_Prm_Cst_Type=6 Then 1
		  When M.Qt_Prm_Cst_Type=7 And D.Cust_Grp_Code	   = '||NVL(V_Cst_Grp_Csh,0)||'     Then 1
		  When M.Qt_Prm_Cst_Type=8 And D.C_Code_Csh	= '||NVL(P_c_code_csh,0)||'	Then 1
		  Else 0 End)=1
	 And (Case When M.Qt_Prm_Itm_Type Is Null Then 1
		 When M.Qt_Prm_Itm_Type=1 And D.G_Code=(Select G_Code From Ias_Itm_mst Where I_Code='''||P_Icode||''' And RowNum<=1) Then 1
		 When M.Qt_Prm_Itm_Type=2 And D.Mng_Code=(Select Nvl(Mng_Code,''0'') From Ias_Itm_mst Where I_Code='''||P_Icode||''' And RowNum<=1) Then 1
		 When M.Qt_Prm_Itm_Type=3 And D.Subg_Code=(Select Nvl(Subg_Code,''0'') From Ias_Itm_mst Where I_Code='''||P_Icode||''' And RowNum<=1) Then 1
		 When M.Qt_Prm_Itm_Type=4 And D.Assistant_No=(Select Nvl(Assistant_No,''0'') From Ias_Itm_mst Where I_Code='''||P_Icode||''' And RowNum<=1) Then 1
		 When M.Qt_Prm_Itm_Type=5 And D.Detail_No=(Select Nvl(Detail_No,''0'') From Ias_Itm_mst Where I_Code='''||P_Icode||''' And RowNum<=1) Then 1
		 When M.Qt_Prm_Itm_Type=6 And D.Group_No=(Select Nvl(Group_No,0) From Ias_Itm_mst Where I_Code='''||P_Icode||''' And RowNum<=1) Then 1
		 When M.Qt_Prm_Itm_Type=7 And D.Item_Type=(Select Nvl(Item_Type,0) From Ias_Itm_mst Where I_Code='''||P_Icode||''' And RowNum<=1) Then 1
		 When M.Qt_Prm_Itm_Type=8 And D.Grp_Class_Code=(Select nvl(Grp_Class_Code,''0'') From Ias_Itm_mst Where I_Code='''||P_Icode||''' And RowNum<=1) Then 1
		 When M.Qt_Prm_Itm_Type=9 And Exists(Select 1 From Ias_Qut_Prm_Grp_Dtl Where Prm_Grp_No=D.Prm_Grp_No And I_Code='''||P_Icode||''' And RowNum<=1) Then 1
		 Else 0 End)=1
	 And (Case When Qt_Prm_Cst_Type In (2,3,4) And '''||P_C_Code||''' Is Not Null And '''||P_C_Code||'''  In (Select C_Code
												 From Ias_Cst_Expt_Qut_Prm
												Where Quot_Ser=M.Quot_Ser) Then 0 Else 1 End)=1
	 And Nvl(M.Inactive,0)=0
	 And Nvl(M.APPROVED,0)= 1
	 And Nvl(M.Use_qtn_prm_in_pos_sys_flg,0)=1
	 And Decode('||P_Bill_Doc_Type||',4,2,8,2,1) = Decode(M.Bill_Doc_Type,Null,Decode('||P_Bill_Doc_Type||',4,2,8,2,1),M.Bill_Doc_Type)
	 And '''||P_date||''' Between F_Date And T_Date
	 And To_Char(To_Date('''||P_date||'''),''D'') In (Fld_Day1,Fld_Day2,Fld_Day3,Fld_Day4,Fld_Day5,Fld_Day6,Fld_Day7)
	 And (CASE WHEN IAS_QUT_PRM_MST.F_Time IS NULL	OR IAS_QUT_PRM_MST.F_Time IS NULL THEN 1
								  WHEN IAS_QUT_PRM_MST.F_Time <=IAS_QUT_PRM_MST.T_Time	AND To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS'') BETWEEN IAS_QUT_PRM_MST.F_Time AND IAS_QUT_PRM_MST.T_Time THEN 1
								  WHEN IAS_QUT_PRM_MST.F_Time > IAS_QUT_PRM_MST.T_Time	AND (To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS'') > IAS_QUT_PRM_MST.F_Time OR To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS'') < IAS_QUT_PRM_MST.T_Time ) THEN 1
								  ELSE 0
							      End)=1
	 And Nvl(D.Batch_No,''0'')= Decode(Nvl(D.Batch_No,''0''),''0'',Nvl(D.Batch_No,''0''),Nvl('''||P_Batch_No||''',''0''))
	 And Nvl(D.Expire_Date,''01/01/1900'')=Decode(Nvl(D.Expire_Date,''01/01/1900''),''01/01/1900'',Nvl(D.Expire_Date,''01/01/1900''),Nvl('''||P_Exp_Date||''',''01/01/1900''))';
     ---##---------------------------------------------------------------------------------##---
      DBMS_OUTPUT.PUT_LINE(G_DYN_QRY);
      ---##---------------------------------------------------------------------------------##---
      OPEN V_DYN_RFC FOR G_DYN_QRY ;
      LOOP
	 BEGIN
	      FETCH V_DYN_RFC INTO G_DYN_REC;
	      EXIT WHEN V_DYN_RFC%NOTFOUND;
	 EXCEPTION  WHEN OTHERS THEN
	     --DBMS_OUTPUT.PUT_LINE('G_DYN_QRY' );
	     RAISE_APPLICATION_ERROR(-20101, 'DYN_ERR '||SQLCODE||' : '||SQLERRM) ;
	 END;
	      PIPE ROW(G_DYN_REC);
      END LOOP;
      CLOSE V_DYN_RFC;
      ---##---------------------------------------------------------------------------------##---
 Exception When Others Then
    RAISE_APPLICATION_ERROR(-20635,'ERROR IN CREATE VIEW DYN_QT_PRM_DUP_IC_VW:'||SQLERRM);
 End DYN_QT_PRM_DUP_IC_VW;
--##-----------------------------------------------------------------------------------------------------##--
End Ias_Qt_Prm_Pkg;
/
