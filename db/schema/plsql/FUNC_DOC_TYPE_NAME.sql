-- FUNCTION: DOC_TYPE_NAME (status: INVALID)
CREATE OR REPLACE
FUNCTION Doc_Type_Name(P_lang	 In NUMBER,
										    P_doctype In NUMBER,
										    P_jvtype  In NUMBER Default Null) RETURN CHAR Is
				
				v_jvname VARCHAR2(100);
				v_dvname VARCHAR2(50);				
				BEGIN				
				If P_doctype = 0 Then
				
				    Return (Ias_Gen_Pkg.Get_Prompt (P_lang,1647));
				
				ElsIf P_jvtype Is Null Then				
				    Begin
				       Select FLG_DESC
					   Into v_jvname
					   From S_Flags
					Where Lang_no  = P_lang
					  and Flg_Code ='DOC_TYPE'
					  and Flg_Value= P_doctype;
				       Return(v_jvname);
				    Exception
				       when others then
					   Return(P_doctype);
				    End;				
				ElsIf P_jvtype Is Not Null Then
				    Begin
					Select Flg_Desc
					    Into v_dvname
					    From S_Flags
					Where Lang_no  = P_lang
					  and Flg_Code ='DOC_TYPE'
					  and Flg_Value= P_doctype;				
				    Exception
					When Others Then
					    v_dvname:=Null;
				    End;
				    If P_Doctype In (2,3)  Then
					Begin
					    Select Flg_Desc
						Into v_jvname
						From S_Flags
					    Where Lang_no  = P_lang
					     and Flg_Code ='CASH_CHQ'
					     and Flg_Value= P_jvtype;
					Exception
					    When Others Then
						v_jvname:=Null;
					End;
				    ElsIf P_Doctype In (4,5,6,7)  Then
					Begin
					    Select Flg_Desc
						Into v_jvname
						From S_Flags
					    Where Lang_no  = P_lang
					      and Flg_Code ='TYPE_NAME_SI'
					      and Flg_Value= P_jvtype;
					Exception
					    When Others Then
					    v_jvname:=Null;
					End;
				    ElsIf P_Doctype = 10  Then
					Begin
					    Select Flg_Desc
						Into v_jvname
						From S_Flags
					    Where Lang_no  = P_lang
					      and Flg_Code ='STK_ADJ_TYPE'
					      and Flg_Value= P_jvtype;
					Exception
					    When Others Then
						v_jvname:=Null;
					End;
				    ElsIf P_Doctype >=60  Then
					Begin
					    Select jv_name
						Into v_jvname
						From Ias_Sys.IAS_DOCJV_TYPE_SYSTEMS
					    Where Lang_no  = P_lang
					      and DOC_TYPE = P_Doctype
					      and JV_TYPE  = P_jvtype
					      and Lang_no  = P_lang;
					Exception
					    When Others Then
						Select Flg_Desc
						    Into v_dvname
						    From S_Flags
						      Where Lang_no  = P_lang
							and Flg_Code ='DOC_TYPE'
							and Flg_Value= P_doctype;
					End;
				
				    End If;				
				     Return(v_dvname||' '||v_jvname);				
				Else				
				  Return(P_Doctype);				
				End If;
				
				Exception
				 When Others Then
				   Return(Null);
				END Doc_Type_Name;
/
