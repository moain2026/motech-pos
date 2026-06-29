-- FUNCTION: GET_ICODE_REALQTY (status: INVALID)
CREATE OR REPLACE
FUNCTION Get_Icode_RealQty (P_Icode   In   IAS_ITM_MST.I_CODE%TYPE,
																	  p_Psize   In	 NUMBER,
																	  p_Wcode   In	 WAREHOUSE_DETAILS.W_CODE%TYPE	 DEFAULT NUll)													
				   RETURN NUMBER
				Is
				   V_Avl_Qty	NUMBER:=0;
				   V_Pos_Qty	NUMBER:=0;
				   V_Pos_Rt_Qty NUMBER:=0;
				   V_Real_Qty	NUMBER:=0;
				BEGIN
				--=======================================================
				   Begin
				     Select nvl(Sum(distinct avl_qty),0)/P_Psize
				      Into V_Avl_Qty
				      From Ias_Itm_Wcode
				       Where I_Code=P_Icode		
					 and Ias_Itm_Wcode.W_Code=Nvl(P_Wcode,Ias_Itm_Wcode.W_Code);
				   Exception
				     WHEN NO_DATA_FOUND    THEN
					V_Avl_Qty:=0;
				       WHEN Others  THEN
				     V_Avl_Qty:=0;
				   End;
				       --##Get Bill Qty
				   Begin
				
				     Select (Sum(Nvl(P_qty,0))+Sum(Nvl(Free_Qty,0)*Nvl(P_Size,1))) /P_Psize
				      Into V_Pos_Qty
				       From ias_pos_Bill_Mst m,Ias_pos_Bill_Dtl d
					Where m.bill_no=d.bill_no
					    and I_Code=P_Icode
					    and d.W_Code=Nvl(P_Wcode,D.W_Code)
					    and Nvl(POSTED,0)=0;
				   Exception
				     WHEN NO_DATA_FOUND    THEN
					V_Pos_Qty:=0;
				       WHEN Others  THEN
				     V_Pos_Qty:=0;
				   End;
				       --##Get Rt Bill Qty
				   Begin
				    Select (Sum(Nvl(P_qty,0))+Sum(Nvl(Free_Qty,0)*Nvl(P_Size,1))) /P_Psize
				      Into V_Pos_Rt_Qty
				       From  Ias_pos_Rt_Bill_Mst m,Ias_pos_Rt_Bill_Dtl d
					Where m.Rt_Bill_no=d.Rt_Bill_no
					   and I_Code=P_Icode
					   and d.W_Code=Nvl(P_Wcode,D.W_Code)
					   and Nvl(POSTED,0)=0;
				   Exception
				     WHEN NO_DATA_FOUND    THEN
					V_Pos_Rt_Qty:=0;
				       WHEN Others  THEN
				     V_Pos_Rt_Qty:=0;
				   End;
				--=======================================================
				   V_Real_Qty :=Nvl(V_Avl_Qty,0)-Nvl(V_Pos_Qty,0)+Nvl(V_Pos_Rt_Qty,0);
				   Return (nvl(V_Real_Qty,0));
				END Get_Icode_RealQty;
/
