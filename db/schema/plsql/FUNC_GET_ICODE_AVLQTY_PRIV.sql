-- FUNCTION: GET_ICODE_AVLQTY_PRIV (status: INVALID)
CREATE OR REPLACE
FUNCTION Get_Icode_AvlQty_Priv ( P_Icode   In	VARCHAR2,
													  P_Psize   In	 NUMBER,
													  P_Wcode   In	 WAREHOUSE_DETAILS.W_CODE%TYPE	 DEFAULT NUll,
													  P_UserNo  In	 Number )
				   RETURN NUMBER
				Is
				   avlq   NUMBER:=0;
				BEGIN
				--=======================================================
				   If P_Wcode Is Not Null Then --(1)
				
				       Begin
					  Select nvl(Sum(distinct Avl_qty),0)/P_Psize
					     Into avlq
					     From Ias_Itm_Wcode,Privilege_wh
					    Where I_Code=P_Icode
					      and U_id=P_UserNo
					      and Ias_Itm_Wcode.w_code=Privilege_wh.w_code
					      and Ias_Itm_Wcode.W_code=P_Wcode
					      and nvl(add_flag,0)=1;
				       Exception
					    WHEN NO_DATA_FOUND THEN
					     avlq:=0;
					    WHEN Others THEN
					     avlq:=0;
					 End;
				--=======================================================
				   Else --(1)
				--=======================================================
				      Begin
					 Select Sum(avlq)/P_Psize Into avlq From (
						Select Sum(distinct Avl_qty) avlq,Ias_Itm_Wcode.w_code
						  From Ias_Itm_Wcode,Privilege_wh
						 Where I_Code=P_Icode
						   and U_id=P_UserNo
						   and Ias_Itm_Wcode.w_code=Privilege_wh.w_code
						   and nvl(add_flag,0)=1
						 Group By Ias_Itm_Wcode.w_code	);
					Exception When Others Then
					 avlq:=0;
				      End;
				   End If; --(1)
				--=======================================================
				  RETURN (nvl(avlq,0));
				EXCEPTION
				   WHEN NO_DATA_FOUND  THEN
				     RETURN 0;
				   WHEN Others	THEN
				     RETURN Null;
				END Get_Icode_AvlQty_Priv;
/
