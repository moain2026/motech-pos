-- PROCEDURE: GET_ICODE_QTY_LMT (status: INVALID)
CREATE OR REPLACE
Procedure Get_Icode_Qty_Lmt (P_Rol_Type    In Number,
								       P_I_Code      In Ias_Itm_Mst.I_Code%Type ,
								       P_Itm_Unt     In Ias_Itm_Dtl.Itm_Unt%Type Default Null,
								       P_W_Code      In Warehouse_Details.W_Code%Type Default Null,
								       P_Brn_No      In S_Brn.Brn_No%Type Default Null,
								       P_I_Rol	     Out Number,
								       P_I_Min_Qty   Out Number,
								       P_I_Max_Qty   Out Number,
								       P_Asm_Ord_Qty Out Number      )	Is
		 Begin
		      If Nvl(P_Rol_Type,1)=1 Then
			Select I_Rol,
				I_Min_Qty,	
				I_Max_Qty,	
				Asm_Ord_Qty
			       Into P_I_Rol,
				P_I_Min_Qty,
				P_I_Max_Qty ,
				P_Asm_Ord_Qty
			  From Ias_Itm_Qty_Lmt
			   Where I_Code        = P_I_Code
			     And Itm_Unt=P_Itm_Unt
			     And Rownum   <= 1 ;
		      Elsif  P_Rol_Type=2 Then
			Select I_Rol,
				I_Min_Qty,	
				I_Max_Qty,	
				Asm_Ord_Qty
			       Into P_I_Rol,
				P_I_Min_Qty,
				P_I_Max_Qty ,
				P_Asm_Ord_Qty
			  From Ias_Itm_Qty_Lmt
			   Where I_Code        = P_I_Code
			     And Itm_Unt=P_Itm_Unt
			     And W_Code=P_W_Code
			     And Rownum  <= 1 ;
		      Elsif  P_Rol_Type=3 Then
			Select I_Rol,
				I_Min_Qty,	
				I_Max_Qty,	
				Asm_Ord_Qty
			       Into P_I_Rol,
				P_I_Min_Qty,
				P_I_Max_Qty ,
				P_Asm_Ord_Qty
			  From Ias_Itm_Qty_Lmt
			   Where I_Code        = P_I_Code
			     And Itm_Unt=P_Itm_Unt
			     --And W_Code=P_W_Code
			     And Brn_No=P_Brn_No
			     And Rownum <= 1 ;
		      End If;
		 Exception
		   When Others Then
		    P_I_Rol:= 0 ;
		 End Get_Icode_Qty_Lmt;
/
