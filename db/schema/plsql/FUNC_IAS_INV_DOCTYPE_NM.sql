-- FUNCTION: IAS_INV_DOCTYPE_NM (status: INVALID)
CREATE OR REPLACE
FUNCTION Ias_Inv_Doctype_Nm( P_lang    In NUMBER,
							  P_doctype In NUMBER,
							  P_jvtype  In NUMBER Default Null) RETURN CHAR IS
v_jvname   Varchar2(100);
v_dvname   VARCHAR2(50);

BEGIN
 If P_Doctype = 5  and P_jvtype Is Not Null Then
       Begin
	  Select Decode(P_Lang,1,incom_name,incom_e_name)
	    Into v_jvname
	    From Incom_Types
	   where Incom_Type=P_jvtype;

	  Return(v_jvname);

	Exception
	 when others then
	   return(P_doctype);
       End;
 Elsif P_Doctype = 6 and P_jvtype Is Not Null Then
      Begin
	Select Decode(P_Lang,1,out_name,out_e_name)
	  Into v_jvname
	  From out_Types
	 where out_Type=P_jvtype;

	Return(v_jvname);

       Exception
	when others then
	 Return(P_doctype);
      End;
 Else
     Begin
	Select Flg_Desc
	  Into v_dvname
	  From S_Flags
	 Where Lang_no	= P_lang
	   and Flg_Code ='DOC_TYPE_INV'
	   and Flg_Value= P_doctype;
      Exception
	 When Others Then
	  v_dvname:=Null;
     End;
     If P_Doctype In (1,2,3,4)	Then
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
     End If;
     Return(v_dvname||' '||v_jvname);
 End If;
 End Ias_Inv_Doctype_Nm;
/
