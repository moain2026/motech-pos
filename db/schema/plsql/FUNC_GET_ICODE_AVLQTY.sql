-- FUNCTION: GET_ICODE_AVLQTY (status: INVALID)
CREATE OR REPLACE
FUNCTION Get_Icode_AvlQty ( P_Icode   In   IAS_ITM_MST.I_CODE%TYPE,
																															   p_Psize   In   NUMBER,
																															   p_Wcode   In   WAREHOUSE_DETAILS.W_CODE%TYPE   DEFAULT NUll,
																															   p_ExpDate In   DATE	   DEFAULT NULL,
																															   p_BatchNo In   VARCHAR2 DEFAULT NULL,
																															   p_idate   In   DATE	   DEFAULT NULL)
				   RETURN NUMBER
				Is
				   avlq   NUMBER:=0;
				BEGIN
				--=======================================================
				   If p_Wcode Is Not Null Then
				
				  	     Begin
							      Select nvl(Sum(distinct Avl_Qty),0)/p_Psize
								     Into avlq
								     From Ias_Itm_Wcode
							Where I_Code=P_Icode
							  and Ias_Itm_Wcode.W_code=p_Wcode;
								   Exception
								     WHEN NO_DATA_FOUND    THEN
								 avlq:=0;
								WHEN Others  THEN
								     avlq:=0;
				  		   End;
				   Else
				      Begin
					     Select Sum(avlq) Into avlq From (
							  Select (Sum(distinct Avl_Qty)/nvl( P_Psize,1)) avlq,w_code
							    From Ias_Itm_Wcode
					       Where Ias_Itm_Wcode.I_code=P_Icode
								       Group By w_code	);
					
						Exception When Others Then
						 avlq:=0;			
				      End;				
				
				   End If;
				--=======================================================
				
				  RETURN (nvl(avlq,0));
				
				EXCEPTION
				   WHEN NO_DATA_FOUND  THEN
				     RETURN 0;
				   WHEN Others	THEN
				     RETURN Null;
				END Get_Icode_AvlQty;
/
