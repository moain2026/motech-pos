-- =============================================
-- PACKAGE SPEC: IAS_DBS_SYS_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
PACKAGE IAS_DBS_Sys_Pkg Is

  FUNCTION  Check_Cons (P_ConsNm   In VARCHAR2 Default Null,
			P_TabNm    In VARCHAR2 Default Null,
  										  P_ConsType In VARCHAR2 Default Null ,
  										  P_ColNm    In VARCHAR2 Default Null) RETURN NUMBER ;
  FUNCTION  Check_Cons_St ( P_ConsNm   In VARCHAR2 Default Null,
			    P_TabNm    In VARCHAR2 Default Null,
  										  	  P_ConsType In VARCHAR2 Default Null ,
  										      P_ColNm	 In VARCHAR2 Default Null) RETURN NUMBER ;
  FUNCTION  Get_Cons_Name ( P_TabNm In VARCHAR2 Default Null,P_ConsType In VARCHAR2 Default Null ,
  											 	  P_ColNm In VARCHAR2 Default Null) RETURN CHAR ;
  FUNCTION  Check_Object ( P_ObjNm In VARCHAR2 ,P_ObjType In VARCHAR2 Default Null , P_ColNm In VARCHAR2 Default Null) RETURN NUMBER ;
  PROCEDURE Check_St_OBJ ( P_Result In Out NUMBER ,P_ObjNm In VARCHAR2 Default Null) ;
  FUNCTION  Check_TabSp ( P_TsNm In VARCHAR2 ) RETURN NUMBER ;
  FUNCTION Check_Ias_User( P_Brn_Year In  number ,P_Brn_no   In  number) RETURN varchar2 ;
  FUNCTION Get_Comment ( P_Lng	   In number,
			 P_TabNm   In varchar2,
			 P_ColNm   In varchar2	Default Null,
			 P_Usr_Nm  In varchar2	Default Null) RETURN Varchar2 ;
  PROCEDURE ALTR_DBS( P_TB IN VARCHAR2, P_TR_TYPE IN VARCHAR2,P_FD IN VARCHAR2);

End IAS_DBS_Sys_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_DBS_SYS_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE Body IAS_DBS_Sys_Pkg IS

--==========================================================================================
FUNCTION Check_Cons ( P_ConsNm	 In VARCHAR2 Default Null,
		      P_TabNm	 In VARCHAR2 Default Null,
  										P_ConsType In VARCHAR2 Default Null ,
  										P_ColNm    In VARCHAR2 Default Null) RETURN NUMBER Is
  Cnt number;

Begin

	 Select Count(1)
	   Into Cnt
		 From User_constraints a, User_cons_columns b
		Where a.owner=b.owner
			and a.constraint_name=b.constraint_name
			and a.table_name=b.table_name
			and a.table_name=Decode(P_TabNm,null,a.table_name,Upper(P_TabNm))
			and b.column_name=Decode(P_ColNm,null,b.column_name,Upper(P_ColNm))
			and a.constraint_type=Decode(P_ConsType,null,a.constraint_type,Upper(P_ConsType))
			and a.constraint_name=Decode(P_ConsNm,null,a.constraint_name,Upper(P_ConsNm));

    RETURN(Cnt);
 Exception
   When others then
     RETURN(0);
End Check_Cons;
--==========================================================================================
FUNCTION Check_Cons_St ( P_ConsNm   In VARCHAR2 Default Null,
			 P_TabNm    In VARCHAR2 Default Null,
  										   P_ConsType In VARCHAR2 Default Null ,
  										   P_ColNm    In VARCHAR2 Default Null) RETURN NUMBER Is
  Cnt number;
Begin
	 Select Count(1)
	   Into Cnt
		 From User_constraints a, User_cons_columns b
		Where a.owner=b.owner
			and a.constraint_name=b.constraint_name
			and a.table_name=b.table_name
			and a.table_name=Decode(P_TabNm,null,a.table_name,Upper(P_TabNm))
			and b.column_name=Decode(P_ColNm,null,b.column_name,Upper(P_ColNm))
			and a.constraint_type=Decode(P_ConsType,null,a.constraint_type,Upper(P_ConsType))
			and a.constraint_name=Decode(P_ConsNm,null,a.constraint_name,Upper(P_ConsNm))
			and a.status = 'DISABLED';
    RETURN(Cnt);
 Exception
   When others then
     RETURN(0);
End Check_Cons_St;


--==========================================================================================
FUNCTION Get_Cons_Name ( P_TabNm In VARCHAR2 Default Null,P_ConsType In VARCHAR2 Default Null ,
  											 P_ColNm In VARCHAR2 Default Null) RETURN CHAR	Is

 v_ConsNm Varchar2(50);
Begin
   Select a.constraint_name Into  v_ConsNm
	   From User_constraints a,User_cons_columns b
    where a.owner=b.owner
			and a.constraint_name=b.constraint_name
			and a.table_name=b.table_name
			and a.table_name=Decode(P_TabNm,null,a.table_name,Upper(P_TabNm))
			and b.column_name=Decode(P_ColNm,null,b.column_name,Upper(P_ColNm))
			and a.constraint_type=Decode(P_ConsType,null,a.constraint_type,Upper(P_ConsType))
			and RowNum<=1;

  RETURN(v_ConsNm);

 Exception
   When others then
     RETURN Null;
End Get_Cons_Name;

--==========================================================================================
FUNCTION Check_Object ( P_ObjNm In VARCHAR2 , P_ObjType In VARCHAR2 Default Null , P_ColNm In VARCHAR2 Default Null) RETURN NUMBER IS
 Cnt NUMBER;
BEGIN

If P_ObjNm Is Not Null and P_ColNm Is Not Null Then
	
 Select 1 Into Cnt
   From User_Tab_Columns
  where Table_Name =Upper(P_ObjNm)
    and Column_name=Upper(P_ColNm)
	  and RowNum<=1;

Else

 Select 1 Into Cnt
   From User_Objects
  Where Object_Name = Upper(P_ObjNm)
    and OBJECT_TYPE = Decode(p_ObjType, Null,OBJECT_TYPE,Upper(p_ObjType))
    and RowNum<=1;

End If;

RETURN(Cnt);

 Exception
   When Others Then
    RETURN(0);
END Check_Object;

--===========================================================================================

PROCEDURE Check_St_OBJ ( P_Result In Out NUMBER ,P_ObjNm In VARCHAR2 Default Null ) Is
Begin

 Select 1
   Into P_Result
   From User_Objects
  where STATUS='INVALID'
    and OBJECT_NAME =Decode( P_ObjNm,null,OBJECT_NAME,Upper(P_ObjNm))
    and RowNum<=1;

If  p_Result > 0 Then

	Declare
		 Cursor c1 Is Select Decode(OBJECT_TYPE,'PACKAGE BODY','PACKAGE',OBJECT_TYPE) OBJECT_TYPE,OBJECT_NAME
				From User_objects
			       Where Status='INVALID'
				 and OBJECT_NAME =Decode( P_ObjNm,null,OBJECT_NAME,Upper(P_ObjNm))
				 and OBJECT_TYPE<>'TABLE';
	Begin
		For i in c1 Loop
			 Begin
	   		Execute Immediate 'ALTER '||i.OBJECT_TYPE||' '||i.OBJECT_NAME||' COMPILE';
			 Exception
		When others then
		  Null;
	     End;
 		 End Loop;
    End;

End If;

 Exception
 When others then
   p_Result:=0;
End  Check_St_OBJ;
--===========================================================================================
FUNCTION  Check_TabSp ( P_TsNm In VARCHAR2 ) RETURN NUMBER Is
 Cnt NUMBER;
BEGIN

 Select 1 Into Cnt
   From User_Tablespaces
  where TABLESPACE_NAME =Upper(P_TsNm)
	  and RowNum<=1;

 RETURN(Cnt);

 Exception
   When Others Then
    RETURN(0);
END Check_TabSp;
--===========================================================================================
Function Check_Ias_User( P_Brn_Year In	Number
			,P_Brn_no   In	Number)
			RETURN varchar2 Is
 V_User  Varchar2(30);
Begin
    Begin
	 Select UserName
	   Into V_User
	   From All_Users
	  where USERNAME='IAS'||P_Brn_Year||P_Brn_No
	    and rownum <= 1;

    Exception
	  --when no_data_found then
	    --null;
      When Others Then
	Raise_Application_Error(-20460,'Error when checking Accounting user existance' || chr(10) || sqlerrm);
    End;

    RETURN Upper(V_User);
End Check_Ias_User;
--==============================================================================
FUNCTION Get_Comment ( P_Lng	 In Number,
		       P_TabNm	 In Varchar2,
		       P_ColNm	 In Varchar2 Default Null,
		       P_Usr_Nm  In Varchar2 Default Null) RETURN varchar2 Is

v_com_dsc Varchar2(800);
v_com_no  Number;
Begin
If P_TabNm Is Not Null and P_ColNm Is Null Then -- Table

    If P_Usr_Nm Is Null Then
      Select COMMENTS
	Into v_com_dsc
	From User_Tab_Comments
       where TABLE_NAME = P_TabNm
	 and RowNum<=1;
    Else
      Select COMMENTS
	Into v_com_dsc
	From ALL_Tab_Comments
       where OWNER = P_Usr_Nm
	 and TABLE_NAME = P_TabNm
	 and RowNum<=1;
    End If;
ElsIf P_TabNm Is Not Null and P_ColNm Is Not Null Then -- Columns

    If P_Usr_Nm Is Null Then
      Select COMMENTS
	Into v_com_dsc
	From User_Col_Comments
       where TABLE_NAME = P_TabNm
	 and COLUMN_NAME =P_ColNm
	 and RowNum<=1;

    Else

      Select COMMENTS
	Into v_com_dsc
	From ALL_Col_Comments
       where Owner = P_Usr_Nm
	 and TABLE_NAME = P_TabNm
	 and COLUMN_NAME =P_ColNm
	 and RowNum<=1;
    End If;
End If;
 Begin
   v_com_no:=v_com_dsc;
   Exception
   when others then
    v_com_no:=null;
 End;

 If v_com_no Is Not Null Then
    RETURN(Ias_Gen_Pkg.Get_Prompt(P_Lng,v_com_no));
 Elsif v_com_dsc Is Not Null Then
    RETURN(v_com_dsc);
 Else
    RETURN(Null);
 End If;
 Exception
   When Others Then
   RETURN(null);
End Get_Comment;
--==============================================================================
PROCEDURE ALTR_DBS( P_TB IN VARCHAR2, P_TR_TYPE IN VARCHAR2,P_FD IN VARCHAR2) Is

Begin
 Execute Immediate 'ALTER TABLE '||P_TB||' '||P_TR_TYPE||' '||P_FD;
Exception
 When Others Then
   Null;
End ALTR_DBS;
--=======================================================================================
End IAS_DBS_Sys_Pkg;
/
