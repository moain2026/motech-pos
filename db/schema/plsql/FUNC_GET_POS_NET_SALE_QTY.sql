-- FUNCTION: GET_POS_NET_SALE_QTY (status: INVALID)
CREATE OR REPLACE
Function Get_Pos_Net_Sale_Qty (P_I_Code     In	 Ias_Itm_Mst.I_Code%Type,
											P_P_Size     In   Number Default 1,
											P_W_Code     In   Warehouse_Details.W_Code%Type   Default Null,
											P_F_Date     In   Date	   Default Null,
											P_T_Date     In   Date	   Default Null,
											P_Exp_Date   In   Date	   Default Null  ,
											P_Batch_No   In   Varchar2 Default Null  ,
											P_Type	     In   Number   Default 1,
											P_F_Brn_No   In   Varchar2 Default Null  ,
								P_T_Brn_No   In   Varchar2 Default Null)
				   Return Number
				Is
				   V_Net_Qty	  Number:=0;
				   V_Pos_Bill_Qty Number:=0;
				   V_Pos_Rt_Qty   Number:=0;
				Begin
				--=======================================================
				   --##Get Bill Qty
				    Begin
				      Select (Sum(Nvl(P_Qty,0))+Sum(Nvl(Free_Qty,0)*Nvl(P_Size,1))) /P_P_Size
				      Into V_Pos_Bill_Qty
				      From Ias_Pos_Bill_Mst M,Ias_Pos_Bill_Dtl D
				       Where M.Bill_No=D.Bill_No
					  And I_Code  =P_I_Code
					  And D.W_Code = Decode(P_W_code,Null,D.W_Code,P_W_code)
						And Expire_Date=Decode(P_Exp_Date,Null,Expire_Date,Nvl(P_Exp_Date,'01/01/1900'))
					  And Batch_No = Decode(P_Batch_No,Null,Batch_No,Nvl(P_Batch_No,'0'))
					  And M.Bill_Date    Between  To_Date(P_F_Date,'DD/MM/YYYY') And To_Date(P_T_Date,'DD/MM/YYYY')
					  And M.Brn_no Between Nvl(P_F_Brn_No,M.Brn_no) And  Nvl(P_T_Brn_No,M.Brn_no)
					  And Nvl(Posted,0)=0;				
				    Exception
				      When No_Data_Found    Then
					 V_Pos_Bill_Qty:=0;
					When Others  Then
				      V_Pos_Bill_Qty:=0;
				    End;
					--##Get Rt Bill Qty
				    Begin
				     Select (Sum(Nvl(P_Qty,0))+Sum(Nvl(Free_Qty,0)*Nvl(P_Size,1))) /P_P_Size
				      Into V_Pos_Rt_Qty
				      From  Ias_Pos_Rt_Bill_Mst M,Ias_Pos_Rt_Bill_Dtl D
				       Where M.Rt_Bill_No=D.Rt_Bill_No
					   And I_Code	 =P_I_Code
					   And D.W_Code = Decode(P_W_code,Null,D.W_Code,P_W_code)
						 And Expire_Date=Decode(P_Exp_Date,Null,Expire_Date,Nvl(P_Exp_Date,'01/01/1900'))
					   And Batch_No = Decode(P_Batch_No,Null,Batch_No,Nvl(P_Batch_No,'0'))
					   And M.Rt_Bill_Date	 Between  To_Date(P_F_Date,'DD/MM/YYYY') And To_Date(P_T_Date,'DD/MM/YYYY')
					   And M.Brn_no Between Nvl(P_F_Brn_No,M.Brn_no) And  Nvl(P_T_Brn_No,M.Brn_no)
					   And Nvl(Posted,0)=0;
				    Exception
				      When No_Data_Found    Then
					 V_Pos_Rt_Qty:=0;
					When Others  Then
				      V_Pos_Rt_Qty:=0;
				    End;
				--=======================================================
				   If Nvl(P_Type,1)=1 Then
				      V_Net_Qty:=Nvl(V_Pos_Bill_Qty,0)-Nvl(V_Pos_Rt_Qty,0);
				   Elsif P_Type=2    Then
				      V_Net_Qty:=Nvl(V_Pos_Bill_Qty,0);
				   Elsif P_Type=3    Then
				      V_Net_Qty:=Nvl(V_Pos_Rt_Qty,0);
				   End If;
				   Return (Nvl(V_Net_Qty,0));
				
				Exception
				   When No_Data_Found  Then
				     Return 0;
				   When Others	Then
				     Return Null;
				End Get_Pos_Net_Sale_Qty;
/
