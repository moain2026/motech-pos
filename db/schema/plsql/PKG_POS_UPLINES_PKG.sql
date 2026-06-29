-- =============================================
-- PACKAGE SPEC: POS_UPLINES_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE POS_UPLINES_PKG
IS
--##Type declarations----------------------------------------------------------
TYPE doc_record IS RECORD (
    doc_type	 number,
    doc_no	 number,
    doc_ser	 number,
    doc_date	 date,
    doc_time	 date,
    doc_currency varchar2(3),
    doc_amt	 number,
    vat_amt	 number,
    mobile_no	 varchar2(16)
);

TYPE doc_table IS TABLE OF doc_record;

--##Global variables declaration------------------------------------------------
G_proxy_url		varchar2(250) := 'http://localhost:5000';
G_base_url		varchar2(250) := 'https://dev-vendor.uplines.com';
G_username		varchar2(100);
G_password		varchar2(100);
G_lang_no		number := 1;
G_Access_token		varchar2(1000);
G_Refresh_Token 	varchar2(1000);
G_Api_Key		varchar(256);
G_Vender_Id		varchar2(64);
G_Branch_Id		varchar2(64);


PROCEDURE Login(p_email 	in  varchar2,	--
		p_password	in  varchar2);

PROCEDURE Refresh_Access_Token(p_refresh_token	       in  varchar2);

PROCEDURE Revoke_Refresh_Token(p_refresh_token	       in  varchar2);

PROCEDURE Generate_Api_Key( p_email	    in	varchar2,
			    p_password	    in	varchar2);

PROCEDURE Revoke_Api_Key( p_api_key	    in	varchar2);

procedure Register_Invoice( p_brn_no	    in	number,
			    p_doc_type	    in	number,
			    p_bill_no	    in	number,     --A number that identifies an invoice uniquely per branch
			    p_bill_ser	    in	number,
			    p_mobile_no     in	varchar2,   --Phone number of the member to identify
			    p_bill_curr     in	varchar2,   --The currency of the monetary amount. Must be SAR
			    p_bill_total    in	number,     --The value for the amount of money for the given invoice
			    p_vat_total     in	number,     --Total amount of tax for the invoice. The value in "total" does not include the tax
			    p_bill_ad_date  in	date,	    --Exact time when invoice was created
			    p_bill_ref_no   out varchar2,    --The returned invoice reference number. This must be kept for issuing invoice refund
			    p_customer_name out varchar2
			    );

procedure Register_Invoices (p_brn_no	     in  number,
			     p_ref_cur	    in	sys_refcursor);

PROCEDURE Refund_Invoice(p_brn_no	    in	number,
			 p_doc_type	    in	number,
			 p_rt_bill_no	    in	number,
			 p_rt_bill_ser	    in	number,
			 p_bill_ref_no	    in	varchar2);

PROCEDURE Get_Member_details( p_phone_number	in  varchar2,
			      p_customer_name	out varchar2);

procedure Call_Api(p_url		in	varchar2,
		   p_method		in	varchar2,
		   p_content		in	varchar2,
		   p_content_type	in	varchar2,
		   p_http_status_code	out	number,
		   p_response		out	clob);

procedure Set_web_srvc_prmtr(p_brn_no	  in	  number);

function Get_Error_details (p_response	in  varchar2) return varchar2;

procedure Insert_Or_Update_Data(p_doc_no	number,
				p_doc_ser	number,
				p_doc_type	number,
				p_doc_ser_extrnl  varchar2,
				p_sync_flg	number,
				p_sync_rslt	varchar2   default null);

    FUNCTION  GET_AGNCY_TYP_FUN(P_AGNCY_NO IN ARS_MRKTING_AGNCY.AGNCY_NO%TYPE) RETURN NUMBER;

    PROCEDURE  SYNC_RT_BILL_PRC(P_RT_BILL_SRL  IN NUMBER,P_TYP IN NUMBER DEFAULT 1);

END POS_UPLINES_PKG ;
/

-- ---------------------------------------------
-- PACKAGE BODY: POS_UPLINES_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY POS_UPLINES_PKG
IS
--##----------------------------------------------------------------------------------##--
PROCEDURE Login(p_email 	in  varchar2,
		p_password	in  varchar2)
IS
v_url		    varchar2(100) := '/integration/v1/auth/login';
V_content	    Varchar2(1000);
V_response_text     Varchar2(32000);
V_response_code     Number;
BEGIN
    --Try getting access token by refersh token
    if g_refresh_token is not null then
	Refresh_Access_Token(g_refresh_token);
	if g_access_token is not null then
	    return;
	end if;
    end if;

    IF p_email is null or p_password is null then
	RAISE_APPLICATION_ERROR(-20101, 'email and password must not be empty');
    END IF;


    v_content := '{
    "email":"' || p_email || '",
    "password":"' || p_password || '"
}';


    Call_Api(p_url		  =>v_url,
	     p_method		  =>'POST',
	     p_content		  =>v_content,
	     p_content_type	  =>'application/json',
	     p_http_status_code   =>V_response_code,
	     p_response 	  =>V_response_text);



    if v_response_code not in (200, 201) then
	raise_application_error(-20001, 'unable to get access token: '||Get_Error_details(v_response_text));
    end if;

    for i in (select *
	     from json_table( v_response_text, '$' Columns(
		success 	    VARCHAR2(5)    PATH '$.success',
		access_Token	    VARCHAR2(1000)    PATH '$.data.accessToken',
		refresh_Token	    VARCHAR2(1000)    PATH '$.data.refreshToken')))
    loop
	if i.success = 'false' then
	    raise_application_error(-20001, 'Error: '||Get_Error_details(v_response_text));
	end if;
	dbms_output.put_line('access-token:'||i.access_token);
	dbms_output.put_line('refresh-token:'||i.refresh_token);
	G_access_token	:= i.access_token;
	G_Refresh_Token := i.refresh_token;
    end loop;
END LOGIN;


PROCEDURE Refresh_Access_Token(p_refresh_token	       in  varchar2)
IS
v_url		    varchar2(100) := '/integration/v1/auth/refresh';
V_content	    Varchar2(1000);
V_response_text     Varchar2(32000);
V_response_code     Number;
BEGIN

    dbms_output.put_line('getting access token using refresh token..');

    IF p_refresh_token is null then
	return;
    END IF;

    v_content := '{
    "refreshToken":"' || p_refresh_token || '"
}';

    Call_Api(p_url		  =>v_url,
	     p_method		  =>'POST',
	     p_content		  =>v_content,
	     p_content_type	  =>'application/json',
	     p_http_status_code   =>V_response_code,
	     p_response 	  =>V_response_text);

    if v_response_code not in (200, 201) then
	raise_application_error(-20001, 'unable to get refersh token: '||Get_Error_Details(v_response_text));
    end if;

    for i in (select *
	     from json_table( v_response_text, '$' Columns(
		success 	    VARCHAR2(5)    PATH '$.success',
		access_Token	    VARCHAR2(1000)    PATH '$.data.accessToken')))
    loop
	if i.success = 'true' then
	    dbms_output.put_line('New access token retrived by refersh token.');
	    G_access_token := i.access_token;
	else
	    dbms_output.put_line('Unable to get new access token by refresh token.');
	end if;
    end loop;

END Refresh_Access_Token;

PROCEDURE Revoke_Refresh_Token(p_refresh_token	       in  varchar2)
IS
v_url		    varchar2(100) := '/integration/v1/auth/refresh';
V_content	    Varchar2(1000);
V_response_text     Varchar2(32000);
V_response_code     Number;
BEGIN

    IF p_refresh_token is null then
	RAISE_APPLICATION_ERROR(-20101, 'Refresh token must not be empty');
    END IF;

    if g_access_token is null then
	Login(G_username, G_Password);
    end if;

    v_content := '{
    "refreshToken":"' || p_refresh_token || '"
}';

    Call_Api(p_url		  =>v_url,
	     p_method		  =>'POST',
	     p_content		  =>v_content,
	     p_content_type	  =>'application/json',
	     p_http_status_code   =>V_response_code,
	     p_response 	  =>V_response_text);

    if v_response_code not in (200, 201) then
	raise_application_error(-20001, 'unable to revoke refresh token: '||Get_error_Details(v_response_text));
    end if;

    for i in (select *
	     from json_table( v_response_text, '$' Columns(
		success 	    VARCHAR2(5)    PATH '$.success',
		access_Token	    VARCHAR2(1000)    PATH '$.data.accessToken')))
    loop
	if i.success = 'false' then
	    raise_application_error(-20001, 'Error: '||Get_Error_details(v_response_text));
	end if;
	G_access_token := i.access_token;
    end loop;

END Revoke_Refresh_Token;

PROCEDURE Generate_Api_Key( p_email	    in	varchar2,
			    p_password	    in	varchar2)
IS
v_url		    varchar2(100) := '/integration/v1/auth/api-keys';
V_content	    Varchar2(1000);
V_response_text     Varchar2(32000);
V_response_code     Number;
BEGIN

    IF p_email is null or p_password is null then
	RAISE_APPLICATION_ERROR(-20101, 'email and password must not be empty');
    END IF;

    if g_access_token is null then
	Login(G_username, G_Password);
    end if;

    v_content := '{
    "email":"' || p_email || '",
    "password":"' || p_password || '"
}';

    Call_Api(p_url		  =>v_url,
	     p_method		  =>'POST',
	     p_content		  =>v_content,
	     p_content_type	  =>'application/json',
	     p_http_status_code   =>V_response_code,
	     p_response 	  =>V_response_text);

    if v_response_code not in (200, 201) then
	raise_application_error(-20001, 'unable to genenrate api key: '||Get_Error_Details(v_response_text));
    end if;

    for i in (select *
	     from json_table( v_response_text, '$' Columns(
		success 	VARCHAR2(5)    PATH '$.success',
		api_Key 	VARCHAR2(1000)	  PATH '$.data.apiKey')))
    loop
	if i.success = 'false' then
	    raise_application_error(-20001, 'Error: '||Get_Error_details(v_response_text));
	end if;
	G_Api_Key := i.api_Key;
    end loop;
END Generate_Api_Key;

PROCEDURE Revoke_Api_Key( p_api_key	  in  varchar2)
IS
v_url		    varchar2(100) := '/integration/v1/auth/api-keys/revoke';
V_content	    Varchar2(1000);
V_response_text     Varchar2(32000);
V_response_code     Number;
BEGIN

    IF p_api_key is null then
	RAISE_APPLICATION_ERROR(-20101, 'Api-key must not be empty');
    END IF;

    if g_access_token is null then
	Login(G_username, G_Password);
    end if;

    v_content := '{
    "apiKey":"' || p_api_key || '"
}';

    Call_Api(p_url		  =>v_url,
	     p_method		  =>'POST',
	     p_content		  =>v_content,
	     p_content_type	  =>'application/json',
	     p_http_status_code   =>V_response_code,
	     p_response 	  =>V_response_text);

    if v_response_code not in (200, 201) then
	raise_application_error(-20001, 'unable to revoke api key: '||Get_Error_Details(v_response_text));
    end if;

    for i in (select *
	     from json_table( v_response_text, '$' Columns(
		success 	    VARCHAR2(5)    PATH '$.success')))
    loop
	if i.success <> 'true' then
	    raise_application_error(-20001, 'Unable to revoke the API-KEY. '||Get_Error_Details(v_response_text));
	end if;
    end loop;
END Revoke_Api_Key;

procedure Register_Invoice( p_brn_no	    in	number,
			    p_doc_type	    in	number,
			    p_bill_no	    in	number,     --A number that identifies an invoice uniquely per branch
			    p_bill_ser	    in	number,
			    p_mobile_no     in	varchar2,   --Phone number of the member to identify
			    p_bill_curr     in	varchar2,   --The currency of the monetary amount. Must be SAR
			    p_bill_total    in	number,     --The value for the amount of money for the given invoice
			    p_vat_total     in	number,     --Total amount of tax for the invoice. The value in "total" does not include the tax
			    p_bill_ad_date  in	date,	    --Exact time when invoice was created
			    p_bill_ref_no   out varchar2,    --The returned invoice reference number. This must be kept for issuing invoice refund
			    p_customer_name out varchar2
			    )
is
v_url		    varchar2(100) := '/integration/v1/invoices';
V_content	    Varchar2(1000);
V_response_text     Varchar2(32000);
V_response_code     Number;
begin
    Set_web_srvc_prmtr(p_brn_no);

    IF p_bill_no is null then
	RAISE_APPLICATION_ERROR(-20101, 'p_bill_no must not be empty');
    END IF;

    if g_access_token is null then
	Login(G_username, G_Password);
    end if;

    Get_Member_details( p_phone_number	    => p_mobile_no,
			p_customer_name     => p_customer_name);

    --"vendorId": "'||g_vender_id||'",
    v_content := '
[
    {
	"branchId": "'||g_branch_id||'",
	"invoiceNumber": "'||p_bill_no||'",
	"total":
	    {
		"amount": '||p_bill_total||',
		"currency": "'||p_bill_curr||'"
	    },
	"phoneNumber": "'||p_mobile_no||'",
	"timestamp": "'||TO_CHAR(p_bill_ad_date, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')||'"
    }
]';

    dbms_output.put_line('Before calling Register api');

    Call_Api(p_url		  =>v_url,
	     p_method		  =>'POST',
	     p_content		  =>v_content,
	     p_content_type	  =>'application/json',
	     p_http_status_code   =>V_response_code,
	     p_response 	  =>V_response_text);

    dbms_output.put_line('After calling Register api');
    if v_response_code not in (200, 201) then
	Insert_Or_Update_Data(p_doc_no	      => p_bill_no,
			      p_doc_ser       => p_bill_ser,
			      p_doc_type      => p_doc_type,
			      p_doc_ser_extrnl=> p_bill_ref_no,
			      p_sync_flg      => 3,
			      p_sync_rslt     => Get_Error_Details(v_response_text));
	return;
    end if;

    for i in (select *
	     from json_table( v_response_text, '$' Columns(
		success 	    VARCHAR2(5)    PATH '$.success',
		id		    VARCHAR2(32)    PATH '$.data[*]')))
    loop
       p_bill_ref_no := i.id;

	if i.success <> 'true' then
	    Insert_Or_Update_Data(p_doc_no	  => p_bill_no,
				  p_doc_ser	  => p_bill_ser,
				  p_doc_type	  => p_doc_type,
				  p_doc_ser_extrnl => p_bill_ref_no,
				  p_sync_flg	   => 3,
				  p_sync_rslt	   => Get_Error_Details(v_response_text));
	end if;

	Insert_Or_Update_Data(p_doc_no	      => p_bill_no,
			      p_doc_ser       => p_bill_ser,
			      p_doc_type      => p_doc_type,
			      p_doc_ser_extrnl=> p_bill_ref_no,
			      p_sync_flg      => 1,
			      p_sync_rslt     => null);
    end loop;

end Register_Invoice;

procedure Register_Invoices(p_brn_no	    in	number,
			    p_ref_cur	    in	sys_refcursor)

is
v_doc_type	    number;
v_doc_no	    number;
v_doc_ser	    number;
v_doc_date	    date;
v_doc_time	    date;
v_doc_currency	    varchar(3);
v_doc_amt	    number;
v_vat_amt	    number;
v_mobile_no	    varchar2(16);

v_url		    varchar2(100) := '/integration/v1/invoices';
V_content	    Varchar2(1000);
V_response_text     Varchar2(32000);
V_response_code     Number;
v_doc_ser_extrnl    varchar2(64);
v_docs		    doc_table := doc_table();
begin
    Set_web_srvc_prmtr(p_brn_no);

    if g_access_token is null then
	Login(G_username, G_Password);
    end if;


    v_content := '';

    LOOP
	DECLARE
	    v_doc doc_record;
	    p_bill_ref_no   varchar2(128);
	    p_customer_name varchar2(200);
	BEGIN
	    FETCH p_ref_cur INTO v_doc.doc_type,
				 v_doc.doc_no,
				 v_doc.doc_ser,
				 v_doc.doc_date,
				 v_doc.doc_time,
				 v_doc.doc_currency,
				 v_doc.doc_amt,
				 v_doc.vat_amt,
				 v_doc.mobile_no;
	    EXIT WHEN p_ref_cur%NOTFOUND;
	    v_docs.EXTEND;
	    v_docs(v_docs.LAST) := v_doc;

	    Register_Invoice(p_brn_no	     =>p_brn_no,
			     p_doc_type      =>v_doc.doc_type,
			     p_bill_no	     =>v_doc.doc_no,
			     p_bill_ser      =>v_doc.doc_ser,
			     p_mobile_no     =>v_doc.mobile_no,
			     p_bill_curr     =>v_doc.doc_currency,
			     p_bill_total    =>v_doc.doc_amt,
			     p_vat_total     =>v_doc.doc_amt,
			     p_bill_ad_date  =>to_date(to_char(sysdate,'YYYY-MM-DD"T"')||to_char(sysdate,'HH24:MI:SS"Z"'), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
			     p_bill_ref_no   =>p_bill_ref_no,
			     p_customer_name =>p_customer_name
			    );

	EXCEPTION WHEN OTHERS THEN
	    Insert_Or_Update_Data(p_doc_no	  => v_doc.doc_no,
				  p_doc_ser	  => v_doc.doc_ser,
				  p_doc_type	  => v_doc.doc_type,
				  p_doc_ser_extrnl=> p_bill_ref_no,
				  p_sync_flg	  => 3,
				  p_sync_rslt	  => sqlerrm);
	END;
    END LOOP;
    CLOSE p_ref_cur;

    commit;
end Register_Invoices;

PROCEDURE Refund_Invoice(p_brn_no	    in	number,
			 p_doc_type	    in	number,
			 p_rt_bill_no	    in	number,
			 p_rt_bill_ser	    in	number,
			 p_bill_ref_no	    in	varchar2)
IS
v_url		    varchar2(100) := '/integration/v1/invoices/refund';
V_content	    Varchar2(1000);
V_response_text     Varchar2(32000);
V_response_code     Number;
BEGIN

    Set_web_srvc_prmtr(p_brn_no);

    IF p_bill_ref_no is null then
	RAISE_APPLICATION_ERROR(-20101, 'Bill reference number must not be empty');
    END IF;

    if g_access_token is null then
	Login(G_username, G_Password);
    end if;

    v_content := '["'||p_bill_ref_no||'"]';

    Call_Api(p_url		  =>v_url,
	     p_method		  =>'POST',
	     p_content		  =>v_content,
	     p_content_type	  =>'application/json',
	     p_http_status_code   =>V_response_code,
	     p_response 	  =>V_response_text);

    if v_response_code not in (200, 201) then
	dbms_output.put_line('xxxxx:'||Get_Error_Details(v_response_text));
	Insert_Or_Update_Data(p_doc_no	      => p_rt_bill_no,
			      p_doc_ser       => p_rt_bill_ser,
			      p_doc_type      => p_doc_type,
			      p_doc_ser_extrnl=> p_bill_ref_no,
			      p_sync_flg      => 3,
			      p_sync_rslt     => Get_Error_Details(v_response_text));
	return;
    end if;

    if v_response_text is not null then
	for i in (select *
		 from json_table( v_response_text, '$' Columns(
		    success		VARCHAR2(5)    PATH '$.success')))
	loop
	    if i.success <> 'true' then
		Insert_Or_Update_Data(p_doc_no	      => p_rt_bill_no,
				      p_doc_ser       => p_rt_bill_ser,
				      p_doc_type      => p_doc_type,
				      p_doc_ser_extrnl=> p_bill_ref_no,
				      p_sync_flg      => 3,
				      p_sync_rslt     => Get_Error_Details(v_response_text));
	    end if;

	    Insert_Or_Update_Data(p_doc_no	  => p_rt_bill_no,
				  p_doc_ser	  => p_rt_bill_ser,
				  p_doc_type	  => p_doc_type,
				  p_doc_ser_extrnl=> p_bill_ref_no,
				  p_sync_flg	  => 1,
				  p_sync_rslt	  => null);
	end loop;
    end if;
END Refund_Invoice;

PROCEDURE Get_Member_details( p_phone_number	in  varchar2,
			      p_customer_name out varchar2)
is
v_url		    varchar2(100) := '/integration/v1/members?phoneNumber='||p_phone_number;
V_response_text     Varchar2(32000);
V_response_code     Number;
BEGIN

    IF p_phone_number is null then
	RAISE_APPLICATION_ERROR(-20101, 'Phone number must not be empty');
    END IF;

     if g_access_token is null then
	Login(G_username, G_Password);
    end if;

    Call_Api(p_url		  =>v_url,
	     p_method		  =>'GET',
	     p_content		  =>null,
	     p_content_type	  =>'application/json',
	     p_http_status_code   =>V_response_code,
	     p_response 	  =>V_response_text);

    if v_response_code not in (200, 201) then
	raise_application_error(-20001, 'unable to get member details: '||Get_Error_Details(v_response_text));
    end if;

    for i in (select *
	     from json_table( v_response_text, '$' Columns(
		first_name		VARCHAR2(100)	 PATH '$.firstName',
		last_name		VARCHAR2(100)	 PATH '$.lastName')))
    loop
	p_customer_name := i.first_name ||' '||i.last_name;
    end loop;
end;

procedure Call_Api(p_url		in	varchar2,
		   p_method		in	varchar2,
		   p_content		in	varchar2,
		   p_content_type	in	varchar2,
		   p_http_status_code	out	number,
		   p_response		out	clob)
is
v_rspns_blob	    blob;
v_file_name	    varchar2(256);
v_status_code	    number;
v_message	    varchar2(1024);
v_success	    varchar2(10);
v_user_message	    varchar2(1024);
v_rule_code	    varchar2(1024);
v_jobj_tmp	    pljson;
v_proxy_body	    Clob;
v_content	    clob;
v_rule_code_msg     varchar2(1024);
PRAGMA AUTONOMOUS_TRANSACTION;
begin
    if nvl(p_url,'') = '' then
	raise_application_error(-20001,'Invalid value for parameter p_url');
    end if;

   dbms_output.put_line(p_content);
    if p_content is not null then
	v_content := REPLACE(REPLACE(REPLACE(p_content, CHR(10), ''), CHR(13), ''), CHR(9), '');

	-- Trim excessive spaces between keys and values
	v_content := REGEXP_REPLACE(v_content, '\s*:\s*', ':');
	v_content := REGEXP_REPLACE(v_content, '\s*,\s*', ',');


	--dbms_output.put_line(v_content);
	v_content := replace(v_content,'"','\"');
    end if;

    <<call_endpoint>>

    v_proxy_body:= '{
		    "request":{
			"url":"'||g_base_url||p_url||'",
			"method":"'||p_method||'",
			"username":"",
			"password":"",
			"contentType":"'||p_content_type||'",
			"body":"'||v_content||'",
			"header":[
			    {
				"name":"Authorization",
				"value":"Bearer '||g_access_token||'"
			    }
			],
			"parameters":[]
		    }
		 }';

    dbms_output.put_line(v_proxy_body);


    ias_web_srvc_pkg.Call_Web_Service_blob(p_url   => g_proxy_url || '/api/proxy',
					   p_method  =>'POST',
					   p_content_type => 'application/json',
					   p_content => v_proxy_body,
					   p_response_blob => v_rspns_blob,
					   p_http_rspons_code => p_http_status_code,
					   p_file_name	      => v_file_name,
					   p_wallet_path => null,
					   p_wallet_pwd => null,
					   p_username => null,
					   p_password  => null,
					   p_token => null);

     p_response := ias_web_srvc_pkg.BLOB_TO_CLOB(v_rspns_blob);
	dbms_output.put_line('response:'||substr(p_response,0,300));

    if p_http_status_code = 401 then
	 G_access_token := null;
	 --login(g_username, g_password);
	 --goto call_endpoint;
    end if;

    if DBMS_LOB.GETLENGTH(v_rspns_blob) > 0 then
	p_response := ias_web_srvc_pkg.BLOB_TO_CLOB(v_rspns_blob);
	dbms_output.put_line('response:'||substr(p_response,0,300));
    end if;

End Call_Api;

procedure Set_web_srvc_prmtr(p_brn_no	  in	  number)
is
begin
    SELECT
	SRVC_URL,
	USER_NAME,
	PASSWORD,
	NVL(IAS_PRMTR_PKG.GETPVAL(P_PRMTR=>'LANG_NO'), 1),
	UPLINES_BRN_ID,
	WSFTY_FACILITYID
    INTO
	G_PROXY_URL,
	G_USERNAME,
	G_PASSWORD,
	G_LANG_NO,
	G_Branch_Id,
	G_Vender_Id
    FROM GNR_WEB_SRVC_MST
    WHERE (UPPER(SRVC_L_DSC) = 'UPLINES' OR UPPER(SRVC_F_DSC) = 'UPLINES')
    AND BRN_NO=P_BRN_NO
    AND ROWNUM<=1;

EXCEPTION WHEN
    NO_DATA_FOUND THEN
	--RAISE_APPLICATION_ERROR(-20001, 'Error when getting web service parameters - No Data Found');
	null;
end Set_web_srvc_prmtr;

function Get_Error_details (p_response	in  varchar2) return varchar2
is
p_error_messages varchar2(32000);
begin
    for i in (select *
		from json_table(p_response, '$.errors[*]' Columns(
		    code		VARCHAR2(30)	PATH '$.code',
		    message	    VARCHAR2(100)   PATH '$.message')))
    loop
	--dbms_output.put_line('x:'||i.code ||'-'||i.message);
	p_error_messages := nvl(p_error_messages,'') || i.code ||'-'|| i.message || chr(10);
    end loop;
    return p_error_messages;
exception when others then
    return p_response;
end;


procedure Insert_Or_Update_Data(p_doc_no	    number,
				p_doc_ser	    number,
				p_doc_type	    number,
				p_doc_ser_extrnl    varchar2,
				p_sync_flg	    number,
				p_sync_rslt	    varchar2   default null)
is
	PRAGMA AUTONOMOUS_TRANSACTION;	
	v_cnt	number;
begin
    select nvl(count(*),0)
    into   v_cnt
    from pos_extrnl_doc_sync
    where doc_ser     = p_doc_ser
      and doc_type     = p_doc_type
      and platform_no = 1;

    if nvl(v_cnt, 0) >= 1 then
	update pos_extrnl_doc_sync
	set    doc_ser_extrnl = p_doc_ser_extrnl,
	       sync_flg       = p_sync_flg,
	       sync_rslt      = case p_sync_flg when 1 then 'Success' else p_sync_rslt end
	where doc_ser	  = p_doc_ser
	   and doc_type     = p_doc_type
	   and platform_no = 1;
    else
	insert into pos_extrnl_doc_sync (
		   doc_no,
		   doc_ser,
		   doc_ser_extrnl,
		   doc_type,
		   platform_f_dsc,
		   platform_l_dsc,
		   platform_no,
		   sync_date,
		   sync_flg,
		   sync_rslt)
	values (p_doc_no,
		p_doc_ser,
		p_doc_ser_extrnl,
		p_doc_type,
		'Uplines',
		'Uplines',
		1,
		sysdate,
		p_sync_flg,
		case p_sync_flg when 1 then 'Success' else p_sync_rslt end);
    end if;
  COMMIT;
end;

    FUNCTION  GET_AGNCY_TYP_FUN(P_AGNCY_NO IN ARS_MRKTING_AGNCY.AGNCY_NO%TYPE) RETURN NUMBER
    IS
       V_AGNCY_TYP  ARS_MRKTING_AGNCY.AGNCY_TYP%TYPE;
    BEGIN
	SELECT AGNCY_TYP
	  INTO V_AGNCY_TYP
	  FROM ARS_MRKTING_AGNCY
	 WHERE AGNCY_NO = P_AGNCY_NO
	   AND ROWNUM <= 1;

	RETURN V_AGNCY_TYP;
    EXCEPTION
	WHEN OTHERS THEN
	    --RAISE_APPLICATION_ERROR(-20109, 'ERROR WHEN GET AGNCY_TYP OF AGNCY_NO =' ||P_AGNCY_NO||CHR(13)|| SQLERRM);
	    RETURN NULL;	
    END GET_AGNCY_TYP_FUN;

    PROCEDURE  SYNC_RT_BILL_PRC(P_RT_BILL_SRL  IN NUMBER,P_TYP IN NUMBER DEFAULT 1)   --P_TYP=1 FROM RT_BILL_SCR ,2 FROM SYNC SCR
    IS
	V_CNT NUMBER := 0;
    BEGIN
	IF P_TYP = 2 THEN
	    BEGIN
		SELECT 1 INTO V_CNT
		  FROM IAS_POS_RT_BILL_MST M,pos_extrnl_doc_sync G
		 WHERE M.BILL_SRL    = G.DOC_SER
		   AND M.RT_BILL_SRL = P_RT_BILL_SRL
		   AND G.DOC_TYPE    = 4
		   AND G.DOC_SER_EXTRNL IS NOT NULL
		   AND ROWNUM <= 1;
	    EXCEPTION
		WHEN OTHERS THEN
		   RAISE_APPLICATION_ERROR(-20110, 'ERROR IN SYNC_RT_BILL_PRC RT_BILL_SER = '||P_RT_BILL_SRL||CHR(13)|| SQLERRM);
	    END;
	END IF;

	FOR RT_CRSR IN (SELECT DISTINCT M.RT_BILL_NO,M.BRN_NO,G.PLATFORM_NO,G.DOC_SER_EXTRNL
			  FROM IAS_POS_RT_BILL_MST M,POS_EXTRNL_DOC_SYNC G
			 WHERE M.BILL_SRL    = G.DOC_SER
			   AND M.RT_BILL_SRL = P_RT_BILL_SRL
			   AND G.DOC_TYPE    = 4
			   AND G.DOC_SER_EXTRNL IS NOT NULL
			   AND ROWNUM <= 1) LOOP

	    BEGIN
		POS_UPLINES_PKG.REFUND_INVOICE(P_BRN_NO      => RT_CRSR.BRN_NO,
					       P_DOC_TYPE    => 5,
					       P_RT_BILL_NO  => RT_CRSR.RT_BILL_NO,
					       P_RT_BILL_SER => P_RT_BILL_SRL,
					       P_BILL_REF_NO => RT_CRSR.DOC_SER_EXTRNL);

	    EXCEPTION
		WHEN OTHERS THEN
		   RAISE_APPLICATION_ERROR(-20111, 'ERROR IN GNR_UPLINES_PKG.REFUND_INVOICE OF RT_BILL_SER =' ||P_RT_BILL_SRL||CHR(13)||'V_DOC_SER_EXTRNL ='||RT_CRSR.DOC_SER_EXTRNL||CHR(13)|| SQLERRM);
	    END;

	END LOOP;
    EXCEPTION
	WHEN OTHERS THEN
	    RAISE_APPLICATION_ERROR(-20112, 'ERROR IN SYNC_RT_BILL_PRC RT_BILL_SER = '||P_RT_BILL_SRL||CHR(13)|| SQLERRM);	
    END SYNC_RT_BILL_PRC;

END POS_UPLINES_PKG ;
/
