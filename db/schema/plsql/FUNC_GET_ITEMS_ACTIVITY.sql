-- FUNCTION: GET_ITEMS_ACTIVITY (status: INVALID)
CREATE OR REPLACE
FUNCTION Get_Items_ACtivity( P_Activity_No  In Ias_Items_Activity_Priv.Activity_No%TYPE ,
															      P_User_No      In User_R.U_Id%Type ,
															      P_Conn_Itm_Act In Ias_Para_Inv.Conn_Itm_Act_By_Usr_Priv%Type,
															      P_Op_type      In Number Default 1) RETURN NUMBER IS
				 Cnt   NUMBER ;
				Begin
				  If Nvl(P_Conn_Itm_Act,0) = 1 Then
				     Begin
					Select 1 Into Cnt
					 From Ias_Items_Activity_Priv
					  Where Ias_Items_Activity_Priv.Activity_No = P_Activity_No
					   And U_Id = P_User_No
					   And Decode(P_Op_type,1,Add_Flag,View_Flag) = 1
					   And RowNum  <= 1 ;
				     Exception
				      When Others Then
				       Cnt := 0 ;
				     End  ;
				  Else
				   Cnt := 1 ;
				  End If ;
				  Return(Cnt);
				Exception
				  When Others Then
				    Return(0);
				End Get_Items_ACtivity;
/
