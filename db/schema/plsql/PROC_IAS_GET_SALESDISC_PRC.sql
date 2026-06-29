-- PROCEDURE: IAS_GET_SALESDISC_PRC (status: INVALID)
CREATE OR REPLACE
PROCEDURE IAS_Get_SalesDisc_Prc ( P_DiscType	   In  NUMBER,
											    P_Sales_Disc_Wcode	In  NUMBER,
											    P_Iprice		In  NUMBER    Default 0,
											    P_Bill_Doc_Type	In  Number,
											    P_bill_i_qty	In  Number    Default 0,
											    P_Icode		In  IAS_ITM_MST.I_CODE%TYPE,
											    P_Itm_Unt		In  IAS_ITM_DTL.ITM_UNT%TYPE,
											    P_Gcode		In  GROUP_DETAILS.G_CODE%TYPE,
											    P_BillDate		In  Date,
											    P_Cst_Class 	In  NUMBER    Default 0,
											    P_c_code		In  CUSTOMER.C_CODE%TYPE  Default Null,
											    P_LevNo		In  IAS_ITEM_PRICE.LEV_NO%TYPE,
											    P_billcur		In  Varchar2,
											    P_billrate		In  NUMBER,
											    P_wcode		In  WAREHOUSE_DETAILS.W_CODE%TYPE,
											    P_whgcode		In  NUMBER,
											    P_dis_per		Out NUMBER,
											    P_dis_amt		Out NUMBER,
											    P_Batch_No		In Sales_Disc.Batch_No%Type,
											    P_Brn_No		In S_Brn.Brn_No%Type) IS
				
				V_USE_APRVD_DISC_TYP number := 0;
			BEGIN
			--##--------------------------------------------##--
			Begin
			   select USE_APRVD_DISC_TYP into V_USE_APRVD_DISC_TYP from ias_para_ar;
			Exception when others then
			  V_USE_APRVD_DISC_TYP :=0;
			End;
			--##--------------------------------------------##--
				-- amt_type 0= Per  , 1= amt
				If ( P_DiscType Between 1 And 9 ) Or ( P_DiscType = 12 ) Then
				Select Decode(amt_type,0,amt),
					       Decode(amt_type,0,(amt*P_Iprice)/100,Decode(a_cy,P_billcur,amt,(ac_rate*1/P_billrate)))
					Into P_dis_per,P_dis_amt
				   From Sales_Disc
				  Where Nvl(G_Code,'0')=Decode(Nvl(G_Code,'0'),'0','0',P_Gcode)
				    and Nvl(I_Code,'0')=Decode(Nvl(I_code,'0'),'0','0',P_Icode)
				    and Nvl(Itm_Unt,'0')=Decode(Nvl(Itm_Unt,'0'),'0','0',P_Itm_Unt)
				    and Nvl(C_Code,'0')=Decode(Nvl(C_Code,'0'),'0','0',P_C_Code)
				    and Nvl(C_Class,0)=Decode(Nvl(C_Class,0),0,0,P_Cst_Class)
				    and Nvl(Lev_No,0)=Decode(Nvl(Lev_No,0),0,0,P_LevNo)
				    And Nvl(Batch_No,'0')=Decode(Nvl(Batch_No,'0'),'0','0',P_Batch_No)
				    and Decode(P_Sales_Disc_Wcode,2,w_code,3,whg_code,0)=Decode(P_Sales_Disc_Wcode,2,P_Wcode,3,P_whgcode,0)
				    and P_BillDate Between F_Date and T_Date
				    and ( V_USE_APRVD_DISC_TYP = 0 or DOC_SER in(select DOC_SER from IAS_SALES_DISC_MST where APPROVED = 1));
				
				ElsIf P_DiscType In (10,11) Then
				Select Decode(amt_type,0,amt),
					       Decode(amt_type,0,(amt*P_Iprice)/100,Decode(a_cy,P_billcur,amt,(ac_rate*1/P_billrate)))
					Into P_dis_per,P_dis_amt
				   From Sales_Disc
				  Where I_Code	= P_Icode
				    and Itm_Unt = P_Itm_Unt
				    and Nvl(P_Bill_I_Qty,0) Between NVL(F_Qty,0) And NVL(T_Qty,0)
				    and Nvl(Bill_Doc_Type,0)=Decode(Nvl(Bill_Doc_Type,0),0,0,P_Bill_Doc_Type)
				    and Decode(P_Sales_Disc_Wcode,2,w_code,3,whg_code,0)=Decode(P_Sales_Disc_Wcode,2,P_Wcode,3,P_whgcode,0)
				    and P_BillDate Between F_Date and T_Date
				    and ( V_USE_APRVD_DISC_TYP = 0 or DOC_SER in(select DOC_SER from IAS_SALES_DISC_MST where APPROVED = 1));
				
				ElsIf P_DiscType In (13,14 ) Then
				Select Decode(amt_type,0,amt),
					       Decode(amt_type,0,(amt*P_Iprice)/100,Decode(a_cy,P_billcur,amt,(ac_rate*1/P_billrate)))
					Into P_dis_per,P_dis_amt
				   From Sales_Disc
				  Where I_Code	= P_Icode
				    and Itm_Unt = P_Itm_Unt
				    and Brn_No	= P_Brn_No
				    and Nvl(Lev_No,0) = Decode(Nvl(Lev_No,0),0,0,P_LevNo)
				    and Decode(P_Sales_Disc_Wcode,2,w_code,3,whg_code,0)=Decode(P_Sales_Disc_Wcode,2,P_Wcode,3,P_whgcode,0)
				    and P_BillDate Between F_Date and T_Date
				    and ( V_USE_APRVD_DISC_TYP = 0 or DOC_SER in(select DOC_SER from IAS_SALES_DISC_MST where APPROVED = 1));
				
				End If;
				 Exception when others then
				   P_dis_per:=0;
				   P_dis_amt:=0;
				END IAS_Get_SalesDisc_Prc;
/
