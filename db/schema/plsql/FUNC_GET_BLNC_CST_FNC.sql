-- FUNCTION: GET_BLNC_CST_FNC (status: INVALID)
CREATE OR REPLACE
FUNCTION Get_BlNC_Cst_Fnc( P_loc_cur	In VARCHAR2,
											    P_cc_code	 In COST_CENTERS.CC_CODE%TYPE Default Null,
											    P_c_code	 In CUSTOMER.C_CODE%TYPE,
											    P_acy	 In VARCHAR2,
											    P_fd 	       In DATE 		 Default Null,
											    P_td  	     In DATE	 Default Null,
											    P_bal_type	 In Number   Default 0)
					 RETURN  NUMBER IS					
							 Bl_Amt   Number:=0;
							 V_Fd	  Date;
							 V_Td	  Date;					
					BEGIN					
				    If P_Fd Is Not Null Then
				       V_Fd:=P_Fd;
				    Elsif P_Fd Is  Null  And P_Td Is Not Null Then
				       V_Fd:=P_Td;
				    End If;				
				    If P_Td Is Not Null Then
				       V_Td:=P_Td;
				    Elsif P_Fd Is Not  Null  And P_Td Is  Null Then
				       V_Td:=P_Fd;				       				
				    End If;					
						If  V_Fd Is Not Null And V_Td Is Not Null Then 						
							   Select Decode(P_Acy,P_Loc_Cur,Nvl(Sum(Dr_Amt),0)-Nvl(Sum(Cr_Amt),0),Nvl(Sum(Dr_Amt_F),0)-Nvl(Sum(Cr_Amt_F),0))
							     Into Bl_Amt
							     From Ias_Post_Dtl
							    Where C_Code=P_C_Code
							      And A_Cy=P_Acy
							      --And Doc_Date Between V_Fd And V_Td
							      And Nvl(Cc_Code,'0') = Decode(P_Cc_Code,Null,Nvl(Cc_Code,'0'),P_Cc_Code);   	
							
						Else
						
							   Select Decode(P_Acy,P_Loc_Cur,Nvl(Sum(Dr_Amt),0)-Nvl(Sum(Cr_Amt),0),Nvl(Sum(Dr_Amt_F),0)-Nvl(Sum(Cr_Amt_F),0))
							     Into Bl_Amt
							     From Ias_Post_Dtl
							    Where C_Code=P_C_Code
							      And A_Cy=P_Acy
							      And Nvl(Cc_Code,'0') = Decode(P_Cc_Code,Null,Nvl(Cc_Code,'0'),P_Cc_Code);
						
						End If; 										
					     Return(Nvl(Bl_Amt,0));					
					Exception When Others Then
					    Return(0);
					End Get_Blnc_Cst_Fnc;
/
