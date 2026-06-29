-- =============================================
-- PACKAGE SPEC: IAS_WEB_SRVC_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE Ias_Web_Srvc_Pkg As
--##----------General Web Service Calling and KNAWAT Implementation

--##Types Decclarations
type http_hdr is record (
    header_attr varchar2(1000),
    header_value varchar2(4000)
  );

type http_hdr_tbl is table of http_hdr;
--##End Type Declarations


--##Web Service Calling procedures

procedure Call_Web_Service_char(p_url	  varchar2,
		  p_method  varchar2 default 'GET',
		  p_content_type varchar2,
		  p_content clob,
		  p_response_text out varchar2,
		  p_http_rspons_code out number,
		  p_wallet_path varchar2,
		  p_wallet_pwd varchar2,
		  p_header  http_hdr_tbl default null,
		  p_username varchar2 default null,
		  p_password  varchar2 default null,
		  p_token varchar2 default null
		  ) ;

procedure Call_Web_Service_blob(p_url	  varchar2,
		  p_method  varchar2 default 'GET',
		  p_content_type varchar2,
		  p_content clob,
		  p_response_blob out blob,
		  p_http_rspons_code out number,
		  p_file_name	     out varchar2,
		  p_wallet_path varchar2,
		  p_wallet_pwd varchar2,
		  p_header  http_hdr_tbl default null,
		  p_username varchar2 default null,
		  p_password  varchar2 default null,
		  p_token varchar2 default null
		  ) ;

procedure Call_Web_Srvc_Ovr_Prxy_Srvc(p_url	varchar2,
		  p_method  varchar2 default 'GET',
		  p_content_type varchar2,
		  p_header http_hdr_tbl,
		  p_content clob,
		  p_response_txt out clob,
		  p_http_rspons_code out number,
		  p_username varchar2 default null,
		  p_password  varchar2 default null,
		  p_prxy_srvc_url varchar2 default null);

function call_gnr_web_srvc( p_doc_type number,
			    p_doc_ser  number,
			    p_sys_no   number default 61,
			    p_lng_no   number,
			    p_srvc_no  number,
			    p_url_para varchar2 default null,
			    p_error    out varchar2) return boolean;

function call_gnr_web_srvc( p_srvc_no	number,
			    p_whr	varchar2,
			    p_header	http_hdr_tbl default null,
			    p_url_para	varchar2,
			    p_error	out varchar2) return boolean;

--##End Web Service Call Procedures

--##Request Body Procedure -- Josn Construction
function Bld_Rqust_body_json(p_srvc_no number,
				 P_WHR VARCHAR2) return clob;

--##end Request Body Procedure -- Josn Construction

--##Utilites
procedure Log_Api_Call( p_f_sys_no number,
			p_url varchar2,
			p_call_src varchar2,
			p_rqust_body clob,
			p_rspns_body clob,
			p_http_code number);
FUNCTION blob_to_clob (p_data  IN  BLOB) RETURN CLOB;
FUNCTION Convert_Json_Array_Into_Object(p_obj  pljson,
					p_path varchar2) RETURN PLJSON;
FUNCTION Convert_Json_Array_To_Scalar(p_obj pljson,
					p_path varchar2) RETURN PLJSON;

procedure Assign_ACL (p_host	    in	    varchar2,
		      p_lower_port  in	    number,
		      p_upper_port  in	    number default null);
--End Utilites

--##Egyption TAX
procedure Check_Doc_Status(p_doc_type	  in  number,
				 p_doc_ser	in  number,
				 p_sys_no	in  number default 61,
				 p_status	out varchar2,
				 p_error	out varchar2) ;
--EndEgyption TAX
--##----------------------------------------------------------------------------------------##--
--Procedure moved from IAS_WEB_DOC_PKG

procedure Get_Doc_As_File(  p_guid	   In	  varchar2,
			    p_file_type    In	  varchar2 default 'xml',
			    p_file_name    In	  varchar2 default null
			 );

procedure Get_Doc_As_File(  P_jv_typ	   In	  number,
			    P_doc_ser	   In	  number,
			    P_brn_usr	   In	  number,
			    p_file_type    In	  varchar2 default 'xml',
			    p_file_name    out	   varchar2
			 );

procedure SendEmailOverApi( p_jv_typ		In	number,
			    p_hashed_doc_ser	In	number,
			    p_brn_usr		In	number,
			    p_subject		In	varchar2,
			    p_message		In	varchar2,
			    p_file_name 	In	varchar2 default null,
			    p_file_content	In	blob default null,
			    p_error		Out	varchar2);

PROCEDURE blob_to_file (p_blob	    IN	BLOB,
			p_dir	    IN	VARCHAR2,
			p_filename  IN	VARCHAR2);
procedure base64encode (p_blob	    In	blob,
			p_clob	    In	out nocopy  clob);
--End moved from IAS_WEB_DOC_PKG

PROCEDURE Get_Dashboard_Data(p_new	    out number,
			     p_success	    out number,
			     p_waiting	    out number,
			     p_declined     out number,
			     p_suspected    out number,
			     p_error	    out number);
End Ias_Web_Srvc_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_WEB_SRVC_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE Body Ias_Web_Srvc_Pkg as
--##--------------------------------------------------------------------------------------------------------##--
--##Web Service Calling procedures
procedure Call_Web_Service_char(p_url	  varchar2,
		  p_method  varchar2 default 'GET',
		  p_content_type varchar2,
		  p_content clob,
		  p_response_text out varchar2,
		  p_http_rspons_code out number,
		  p_wallet_path varchar2,
		  p_wallet_pwd varchar2,
		  p_header  http_hdr_tbl default null,
		  p_username varchar2 default null,
		  p_password  varchar2 default null,
		  p_token varchar2 default null
		  )
as
  v_req utl_http.req;
  v_res utl_http.resp;
  v_content_in_raw raw(32767);
  v_current_chars   INTEGER;
  v_chars_per_chunk number;
  v_clob_offset number;
  v_content_length number;
  v_clob_length number;
  v_chunk_string    VARCHAR2(32767);
begin

  --check if the url is null or empty string
  if p_url is null or p_url='' then
     raise_application_error(-20001,'URL can not be empty');
  end if;

  if p_wallet_path is not null and p_wallet_pwd is not null then
    UTL_HTTP.set_wallet('file:'||p_wallet_path, p_wallet_pwd);
  end if;

  --v_content_in_raw:=UTL_I18N.STRING_TO_RAW(p_content,'AL32UTF8');

  v_req := utl_http.begin_request(p_url, p_method);
  utl_http.set_header(v_req, 'user-agent', 'mozilla/4.0');
  utl_http.set_header(v_req, 'content-type', p_content_type);

  if p_token is not null then
    utl_http.set_header(v_req,'Authorization','Bearer '||p_token);
  elsif p_username is not null and p_password is not null then
    utl_http.set_authentication(v_req, p_username, p_password);
  end if;

  if p_header is not null then
    for i in p_header.first .. p_header.last
    loop
	utl_http.set_header(v_req, p_header(i).header_attr, p_header(i).header_value);
    end loop;
  end if;

  utl_http.set_body_charset(v_req, 'UTF-8');
  utl_http.set_header(v_req, 'Transfer-Encoding','chunked');

  v_clob_length := dbms_lob.getlength( p_content );
  v_chars_per_chunk := FLOOR(32767/4);

  v_clob_offset := 1;
  v_content_length := 0;
  v_clob_offset := 1;

  begin
    while v_clob_offset <= v_clob_length loop
      v_current_chars := v_chars_per_chunk;
      dbms_lob.read( p_content, v_current_chars, v_clob_offset,
		     v_chunk_string );
      exit when v_current_chars < 1;
      -- Use WRITE_TEXT to assure character set conversion if DB charset is not
      -- AL32UTF8 (i.e. UTF-8)
      utl_http.write_text( v_req, v_chunk_string );
      v_clob_offset := v_clob_offset + v_current_chars;
    end loop;
  exception
    when no_data_found then null;
  end;


  v_res := utl_http.get_response(v_req);

  -- process the response from the HTTP call
  UTL_HTTP.READ_TEXT(v_res, p_response_text);
  p_http_rspons_code := v_res.status_code;
  utl_http.end_response(v_res);
  exception
    when utl_http.end_of_body then
	utl_http.end_response(v_res);
    when others then
    utl_http.end_response(v_res);
    raise;
end Call_Web_Service_char;

procedure Call_Web_Service_blob(p_url	  varchar2,
		  p_method  varchar2 default 'GET',
		  p_content_type varchar2,
		  p_content clob,
		  p_response_blob out blob,
		  p_http_rspons_code out number,
		  p_file_name	     out varchar2,
		  p_wallet_path varchar2,
		  p_wallet_pwd varchar2,
		  p_header  http_hdr_tbl default null,
		  p_username varchar2 default null,
		  p_password  varchar2 default null,
		  p_token varchar2 default null
		  )
as
  v_req utl_http.req;
  v_res utl_http.resp;
  v_raw    raw(32767);
  v_content_in_raw raw(32767);
  v_current_chars   INTEGER;
  v_chars_per_chunk number;
  v_clob_offset number;
  v_content_length number;
  v_clob_length number;
  v_chunk_string    VARCHAR2(32767);
  name varchar2(100);
  value varchar2(4000);
begin
  --check if the url is null or empty string
  if p_url is null or p_url='' then
     raise_application_error(-20001,'URL can not be empty');
  end if;

  if p_wallet_path is not null and p_wallet_pwd is not null then
    UTL_HTTP.set_wallet('file:'||p_wallet_path, p_wallet_pwd);
  end if;

  --v_content_in_raw:=UTL_I18N.STRING_TO_RAW(p_content,'AL32UTF8');

  v_req := utl_http.begin_request(p_url, p_method);
  utl_http.set_header(v_req, 'user-agent', 'mozilla/4.0');
  utl_http.set_header(v_req, 'content-type', p_content_type);

  if p_token is not null then
    utl_http.set_header(v_req,'Authorization','Bearer '||p_token);
  elsif p_username is not null and p_password is not null then
    utl_http.set_authentication(v_req, p_username, p_password);
  end if;

  if p_header is not null then
    for i in p_header.first .. p_header.last
    loop
	utl_http.set_header(v_req, p_header(i).header_attr, p_header(i).header_value);
    end loop;
  end if;

  utl_http.set_body_charset(v_req, 'UTF-8');
  utl_http.set_header(v_req, 'Transfer-Encoding','chunked');

  v_clob_length := dbms_lob.getlength( p_content );
  v_chars_per_chunk := FLOOR(32767/4);

  v_clob_offset := 1;
  v_content_length := 0;
  v_clob_offset := 1;

  begin
    while v_clob_offset <= v_clob_length loop
      v_current_chars := v_chars_per_chunk;
      dbms_lob.read( p_content, v_current_chars, v_clob_offset,
		     v_chunk_string );
      exit when v_current_chars < 1;
      -- Use WRITE_TEXT to assure character set conversion if DB charset is not
      -- AL32UTF8 (i.e. UTF-8)
      utl_http.write_text( v_req, v_chunk_string );
      v_clob_offset := v_clob_offset + v_current_chars;
    end loop;
  exception
    when no_data_found then null;
  end;

  v_res := utl_http.get_response(v_req);

  FOR i IN 1..UTL_HTTP.GET_HEADER_COUNT(v_res) LOOP

    UTL_HTTP.GET_HEADER(v_res, i, name, value);
    if name like 'Content-Disposition' then
	if value like '%attachment;%' then
	    p_file_name := substr(value,22);
	    p_file_name := replace(p_file_name,'"','');
	    DBMS_OUTPUT.PUT_LINE(value);
	    DBMS_OUTPUT.PUT_LINE(p_file_name);
	end if;
    end if;
  END LOOP;

  p_http_rspons_code := v_res.status_code;

  DBMS_LOB.createtemporary(p_response_blob, FALSE);
  -- process the response from the HTTP call
  begin
    loop
      UTL_HTTP.read_raw(v_res, v_raw, 32766);
      DBMS_LOB.writeappend (p_response_blob, UTL_RAW.length(v_raw), v_raw);
    end loop;
  exception
    when UTL_HTTP.end_of_body THEN
      UTL_HTTP.end_response(v_res);
  END;
end Call_Web_Service_blob;


procedure Call_Web_Srvc_Ovr_Prxy_Srvc(p_url	varchar2,
		  p_method  varchar2 default 'GET',
		  p_content_type varchar2,
		  p_header http_hdr_tbl,
		  p_content clob,
		  p_response_txt out clob,
		  p_http_rspons_code out number,
		  p_username varchar2 default null,
		  p_password  varchar2 default null,
		  p_prxy_srvc_url varchar2)
as
v_proxy_url varchar2(1000);
v_proxy_body clob;
v_resp_raw blob;
v_http_resp_code number;
v_jobj_tmp pljson;
v_hdr_lst pljson_list;
v_hdr_lst_txt varchar2(4000);
v_file_name varchar2(256);
begin
    if p_header is not null then
	v_hdr_lst := pljson_list();
	for i in p_header.first .. p_header.last
	loop
	    v_hdr_lst.append(pljson('{"name" :"'||p_header(i).header_attr||'",
				   "value":"'||p_header(i).header_value||'"}'));
	end loop;
	begin
	    v_hdr_lst_txt := v_hdr_lst.to_char();
	exception when others then
	    v_hdr_lst_txt := null;
	end;
    end if;
    if v_hdr_lst_txt is null or v_hdr_lst_txt='' then
	v_hdr_lst_txt := '""';
    end if;

    v_jobj_tmp := pljson(p_content);
    v_proxy_body:= '{
		    "request":{
			"url":"'||p_url||'",
			"method":"'||p_method||'",
			"username":"'||p_username||'",
			"password":"'||p_password||'",
			"contentType":"'||p_content_type||'",
			"body":"'||replace(v_jobj_tmp.to_char(false),'"','\"')||'",
			"header":'||v_hdr_lst_txt||'
		    }
		 }';



    Call_Web_Service_blob(p_url   => p_prxy_srvc_url,
		     p_method  =>'POST',
		     p_content_type => 'application/json',
		     p_content => v_proxy_body,
		     p_response_blob => v_resp_raw,
		     p_http_rspons_code => v_http_resp_code,
		     p_file_name	=> v_file_name,
		     p_wallet_path => null,
		     p_wallet_pwd => null,
		     p_username => null,
		     p_password  => null,
		     p_token => null
		    );
    p_response_txt := blob_to_clob(v_resp_raw);
    p_http_rspons_code := v_http_resp_code;
    if v_http_resp_code=200 then
	null;
    end if;

end Call_Web_Srvc_Ovr_Prxy_Srvc;

function call_gnr_web_srvc( p_doc_type number,
			    p_doc_ser  number,
			    p_sys_no   number default 61,
			    p_lng_no   number,
			    p_srvc_no  number,
			    p_url_para varchar2 default null,
			    p_error    out varchar2)
return boolean
as
  v_whr        varchar2(4000);
  v_tbl_nm     varchar2(100);
  v_fld_ser    varchar2(200);
  v_content    clob;
  v_srvc_url   varchar2(2000);
  v_srvc_mthd  varchar2(100);
  v_cntnt_type varchar2(100);
  v_rspons_char    varchar2(4000);
  v_http_rspons_code number;
  v_http_succes_rspns_code varchar2(100);
  v_txt_succes_rspns varchar2(4000);
  v_http_rslt boolean;
  v_text_rslt boolean;
  v_wallet_path varchar2(1000);
  v_wallet_pwd varchar2(100);
  v_username varchar2(100);
  v_password varchar2(100);
  v_prxy_url varchar2(1000);
  v_use_prxy_srvc number;
begin

  /*v_whr := ' WHERE DOC_TYPE='||P_DOC_TYPE||' AND ROWNUM<=1';
  v_tbl_nm:= YS_GEN_PKG.GET_FLD_VALUE('INV_V_DOC_TYPE', 'TB_MST', V_WHR);
  v_fld_ser:= YS_GEN_PKG.GET_FLD_VALUE('INV_V_DOC_TYPE', 'FLD_SER', V_WHR);*/

  V_WHR := ' WHERE DOC_TYP='||CASE WHEN P_SYS_NO = 80 AND P_DOC_TYPE = 4 THEN 130
				   WHEN P_SYS_NO = 80 AND P_DOC_TYPE = 5 THEN 131
				   ELSE P_DOC_TYPE END||' AND ROWNUM <= 1';

  V_TBL_NM := YS_GEN_PKG.GET_FLD_VALUE('GNR_DDC_TBL', 'TBL_MST_NM', V_WHR);
  V_FLD_SER := YS_GEN_PKG.GET_FLD_VALUE('GNR_DDC_TBL', 'TBL_DOCSRL_NM', V_WHR);

  V_WHR := ' AND '||V_TBL_NM||'.'||V_FLD_SER||' = '||P_DOC_SER;

  v_content := bld_rqust_body_json(p_srvc_no,v_whr);

  select web_doc_lnk
  into v_prxy_url
  from ias_para_gen
  where rownum<=1;

  v_prxy_url := v_prxy_url ||'/api/callWebApi';

  if v_prxy_url is null then
      raise_application_error(-20001,'Service Url is not set. Please set the service url in General Parameters');
  end if;

  select srvc_url,
	 srvc_mthd,
	 cntnt_type,
	 http_succes_rspns_code,
	 txt_succes_rspns,user_name,password,
	 nvl(use_prxy_srvc,0)
  into	 v_srvc_url,
	 v_srvc_mthd,
	 v_cntnt_type,
	 v_http_succes_rspns_code,
	 v_txt_succes_rspns,v_username,v_password,
	 v_use_prxy_srvc
  from gnr_web_srvc_mst
  where srvc_no = p_srvc_no
  and rownum<=1;

  if v_use_prxy_srvc = 1 then
    Call_Web_Srvc_Ovr_Prxy_Srvc(
			   p_url   => v_srvc_url || p_url_para,
			   p_method  => v_srvc_mthd,
			   p_content_type => V_CNTNT_TYPE,
			   p_header => null,
			   p_content => v_content,
			   p_response_txt => v_rspons_char,
			   p_http_rspons_code => v_http_rspons_code,
			   p_username => v_username,
			   p_password => v_password,
			   p_prxy_srvc_url => v_prxy_url);
  else
    call_web_service_char(  v_srvc_url,
		     v_srvc_mthd,
		     v_cntnt_type,
		     v_content,
		     v_rspons_char,
		     v_http_rspons_code,
		     v_wallet_path,
		     v_wallet_pwd);
  end if;

  log_api_call(1, v_srvc_url, 'call_gnr_web_srvc', v_content, v_rspons_char, v_http_rspons_code);

  if v_http_succes_rspns_code is not null then
    if '%'||replace(v_http_succes_rspns_code,',','%')||'%' like '%'|| v_http_rspons_code ||'%' then
	v_http_rslt := true;
    else
	v_http_rslt := false;
	p_error := v_rspons_char;
    end if;
  else
    v_http_rslt := true;
  end if;

  if v_txt_succes_rspns is not null then
    if instr(v_rspons_char,v_txt_succes_rspns)>0 then
	v_text_rslt := true;
    else
	v_text_rslt := false;
	p_error := v_rspons_char;
    end if;
  else
    v_text_rslt := true;
  end if;

  return v_http_rslt and v_text_rslt;

  exception when others then
    raise;
end call_gnr_web_srvc ;


function call_gnr_web_srvc( p_srvc_no	number,
			    p_whr	varchar2,
			    p_header	http_hdr_tbl default null,
			    p_url_para	varchar2,
			    p_error	out varchar2)
return boolean
as
  v_content    clob;
  v_srvc_url   varchar2(2000);
  v_srvc_mthd  varchar2(100);
  v_cntnt_type varchar2(100);
  v_rspons_char    varchar2(4000);
  v_http_rspons_code number;
  v_http_succes_rspns_code varchar2(100);
  v_txt_succes_rspns varchar2(4000);
  v_http_rslt boolean;
  v_text_rslt boolean;
  v_wallet_path varchar2(1000);
  v_wallet_pwd varchar2(100);
  v_username varchar2(100);
  v_password varchar2(100);
  v_prxy_url varchar2(1000);
  v_use_prxy_srvc number;
begin

  --v_content := build_request_body_json(p_srvc_no,p_whr);

  v_content := bld_rqust_body_json(p_srvc_no,p_whr);

  select web_doc_lnk
  into v_prxy_url
  from ias_para_gen
  where rownum<=1;

  v_prxy_url := v_prxy_url ||'/api/callWebApi';

  if v_prxy_url is null then
      raise_application_error(-20001,'Service Url is not set. Please set the service url in General Parameters');
  end if;

  select srvc_url,
	 srvc_mthd,
	 cntnt_type,
	 http_succes_rspns_code,
	 txt_succes_rspns,user_name,password,
	 nvl(use_prxy_srvc,0)
  into	 v_srvc_url,
	 v_srvc_mthd,
	 v_cntnt_type,
	 v_http_succes_rspns_code,
	 v_txt_succes_rspns,v_username,v_password,
	 v_use_prxy_srvc
  from gnr_web_srvc_mst
  where srvc_no = p_srvc_no
  and rownum<=1;
  if v_use_prxy_srvc = 1 then
    Call_Web_Srvc_Ovr_Prxy_Srvc(
			   p_url   => v_srvc_url || p_url_para,
			   p_method  => v_srvc_mthd,
			   p_content_type => V_CNTNT_TYPE,
			   p_header => p_header,
			   p_content => v_content,
			   p_response_txt => v_rspons_char,
			   p_http_rspons_code => v_http_rspons_code,
			   p_username => v_username,
			   p_password => v_password,
			   p_prxy_srvc_url => v_prxy_url);
  else
    call_web_service_char(  v_srvc_url|| p_url_para,
		     v_srvc_mthd,
		     v_cntnt_type,
		     v_content,
		     v_rspons_char,
		     v_http_rspons_code,
		     v_wallet_path,
		     v_wallet_pwd);
  end if;

  log_api_call(1, v_srvc_url, 'call_gnr_web_srvc', v_content, v_rspons_char, v_http_rspons_code);

  if v_http_succes_rspns_code is not null then
    if '%'||replace(v_http_succes_rspns_code,',','%')||'%' like '%'|| v_http_rspons_code ||'%' then
	v_http_rslt := true;
    else
	v_http_rslt := false;
	p_error := v_rspons_char;
    end if;
  else
    v_http_rslt := true;
  end if;

  if v_txt_succes_rspns is not null then
    if instr(v_rspons_char,v_txt_succes_rspns)>0 then
	v_text_rslt := true;
    else
	v_text_rslt := false;
	p_error := v_rspons_char;
    end if;
  else
    v_text_rslt := true;
  end if;

  return v_http_rslt and v_text_rslt;

  exception when others then
    raise;
end call_gnr_web_srvc;

--##End Web Service Call Procedures

--##Request Body Procedure -- Josn Construction

function Bld_Rqust_body_json(p_srvc_no number,
				 P_WHR VARCHAR2)
return clob
is
v_cnt number := 0;
v_obj pljson;
v_rqust_body_tmplt clob;
v_j_list pljson_list;
v_json_clob clob;
l_cursor SYS_REFCURSOR;
v_root_obj_name varchar2(100);
v_non_aray_objs varchar2(4000);
v_sclr_aray_objs varchar2(4000);
begin
    v_cnt := ias_gen_pkg.get_cnt('select 1 from gnr_web_srvc_mst where srvc_no='||p_srvc_no||' and rownum<=1');

    if v_cnt <> 1 then
	return EMPTY_CLOB();
    end if;

    select rqust_body_tmplt,
	   root_obj_name,
	   non_aray_objs,
	   sclr_aray_objs
    into   v_rqust_body_tmplt,
	   v_root_obj_name,
	   v_non_aray_objs,
	   v_sclr_aray_objs
    from gnr_web_srvc_mst
    where srvc_no=p_srvc_no;


    if v_rqust_body_tmplt is null or lengthb(v_rqust_body_tmplt)=0 then
	return EMPTY_CLOB();
    end if;

    v_rqust_body_tmplt := replace(v_rqust_body_tmplt,'&P_WHR', p_whr);

    begin
	open l_cursor for v_rqust_body_tmplt;
	APEX_JSON.initialize_clob_output;
	if v_root_obj_name is null or v_root_obj_name = '' then
	    APEX_JSON.write(l_cursor);
	    v_obj := pljson(substr((APEX_JSON.get_clob_output),instr(APEX_JSON.get_clob_output,'[')+1,instr(APEX_JSON.get_clob_output,']',-1)-2));
	else
	    APEX_JSON.open_object;
	    APEX_JSON.write(v_root_obj_name, l_cursor);
	    APEX_JSON.close_object;
	    v_obj := pljson(APEX_JSON.get_clob_output);
	end if;
	APEX_JSON.free_output;

	for i in
	    (SELECT trim(regexp_substr(v_non_aray_objs, '[^,]+', 1, LEVEL)) l
	     FROM dual
	     CONNECT BY LEVEL <= regexp_count(v_non_aray_objs, ',')+1)
	loop
	    v_obj := convert_json_array_into_object(v_obj,i.l);
	end loop;

	for i in
	    (SELECT trim(regexp_substr(v_sclr_aray_objs, '[^,]+', 1, LEVEL)) l
	     FROM dual
	     CONNECT BY LEVEL <= regexp_count(v_sclr_aray_objs, ',')+1)
	loop
	    v_obj := convert_json_Array_To_Scalar(v_obj,i.l);
	end loop;
	--v_obj := pljson(v_j_list.get(1).to_char);
    exception when others then
	v_obj := null;
	raise_application_error(-20001,'The request body is not a valid json : '||sqlerrm);
    end;


    if v_obj is null then
	return EMPTY_CLOB();
    end if;

    v_json_clob := empty_clob();
    dbms_lob.createtemporary(v_json_clob, true);
    v_obj.to_clob(v_json_clob, true);
    return UNISTR(replace(v_json_clob,'\u','\'));
end Bld_Rqust_body_json;

--##end Request Body Procedure -- Josn Construction

--##Utilites
procedure Log_Api_Call( p_f_sys_no number,
			p_url varchar2,
			p_call_src varchar2,
			p_rqust_body clob,
			p_rspns_body clob,
			p_http_code number)
as
v_seq_no number;
begin
    select nvl(max(seq_no),0)+1
    into v_seq_no
    from IAS_EXTRNL_SYS_SYNC_LOG;

    INSERT INTO IAS_EXTRNL_SYS_SYNC_LOG (
	       LOG_DATE,
	       HTTP_CODE,
	       RSPNS_BODY,
	       RQUST_BODY,
	       URL,
	       F_SYS_NO,
	       SEQ_NO)
    values (sysdate,
	    p_http_code,
	    p_RSPNS_BODY,
	    p_RQUST_BODY,
	    p_URL,
	    p_F_SYS_NO,
	    v_SEQ_NO);

end Log_Api_Call;

FUNCTION blob_to_clob (p_data  IN  BLOB)
  RETURN CLOB
AS
  l_clob	 CLOB;
  l_dest_offset  PLS_INTEGER := 1;
  l_src_offset	 PLS_INTEGER := 1;
  l_lang_context PLS_INTEGER := 0;
  l_warning	 PLS_INTEGER;
BEGIN

  DBMS_LOB.createTemporary(
    lob_loc => l_clob,
    cache   => TRUE);

  DBMS_LOB.converttoclob(
   dest_lob	 => l_clob,
   src_blob	 => p_data,
   amount	 => DBMS_LOB.lobmaxsize,
   dest_offset	 => l_dest_offset,
   src_offset	 => l_src_offset,
   blob_csid	 => nls_charset_id('UTF8'),
   lang_context  => l_lang_context,
   warning	 => l_warning);
   RETURN l_clob;
END blob_to_clob ;

function Convert_Json_Array_Into_Object(p_obj pljson,
					p_path varchar2) return pljson
is
v_obj pljson;
v_val pljson_element;
v_jlist pljson_list;
v_tmp_clob clob;
v_parnt_key varchar2(100);
v_chld_path varchar2(4000);
v_rslt_list pljson_list;
begin
    v_obj := p_obj;
    dbms_lob.createtemporary(v_tmp_clob, true);
    if instr(p_path,'.')<=0 then
	if p_obj.exist(p_path) then
	    v_val := p_obj.path(p_path);
	    if v_val.is_array then
		v_val.to_clob(v_tmp_clob);
		v_tmp_clob := substr((v_tmp_clob),instr(v_tmp_clob,'[')+1,instr(v_tmp_clob,']',-1)-2);
		v_obj.put(p_path,pljson(v_tmp_clob));
	    end if;
	end if;
    else
	v_parnt_key := substr(p_path,0,instr(p_path,'.')-1);
	v_chld_path := substr(p_path,instr(p_path,'.')+1);
	if p_obj.exist(v_parnt_key) then
	    v_val := p_obj.get(v_parnt_key);
	    if v_val.is_array then
		v_jlist := pljson_list(v_val);
		v_rslt_list := pljson_list();
		for i in 1..v_jlist.count loop
		    v_val := v_jlist.get(i);
		    v_rslt_list.append(Convert_Json_Array_Into_Object(pljson(v_val), v_chld_path));
		end loop;
		v_obj.put(v_parnt_key,v_rslt_list);
	    else
		v_obj.put(v_parnt_key,Convert_Json_Array_Into_Object(p_obj.get_pljson(v_parnt_key), v_chld_path));
	    end if;
	end if;
    end if;
    return v_obj;
end Convert_Json_Array_Into_Object;

function Convert_Json_Array_To_Scalar(p_obj pljson,
					p_path varchar2) return pljson
is
v_obj		pljson;
v_val		pljson_element;
v_list		pljson_list;
v_element	pljson_element;
v_parnt_key	varchar2(100);
v_chld_path	varchar2(4000);
v_rslt_list pljson_list;
begin
    v_obj := p_obj;
    v_rslt_list := pljson_list();

    if instr(p_path,'.')<=0 then
	if p_obj.exist(p_path) then
	    v_val := p_obj.path(p_path);
	    if v_val.is_array then
		v_list := pljson_list(v_val);
		for i in 1..v_list.count loop
		    v_element := v_list.get(i);
		    if v_element.is_object then
			if v_element.count>1 then
			    raise_application_error(-20010,'Error: Object contains more than one element');
			end if;
			if v_element.get(1).is_string then
			    v_rslt_list.append(v_element.get(1).get_string);
			elsif v_element.get(1).is_number then
			    v_rslt_list.append(v_element.get(1).get_number);
			elsif v_element.get(1).is_bool then
			    v_rslt_list.append(v_element.get(1).get_bool);
			end if;
		    end if;
		end loop;
		v_obj.put(p_path,v_rslt_list);
	    end if;
	end if;
    else
	v_parnt_key := substr(p_path,0,instr(p_path,'.')-1);
	v_chld_path := substr(p_path,instr(p_path,'.')+1);
	if p_obj.exist(v_parnt_key) then
	    v_val := p_obj.get(v_parnt_key);
	    if v_val.is_array then
		v_list := pljson_list(v_val);
		v_rslt_list := pljson_list();
		for i in 1..v_list.count loop
		    v_val := v_list.get(i);
		    v_rslt_list.append(Convert_Json_Array_To_Scalar(pljson(v_val), v_chld_path));
		end loop;
		v_obj.put(v_parnt_key,v_rslt_list);
	    else
		v_obj.put(v_parnt_key,Convert_Json_Array_To_Scalar(p_obj.get_pljson(v_parnt_key), v_chld_path));
	    end if;
	end if;
    end if;

    return v_obj;
end Convert_Json_Array_To_Scalar;

procedure Assign_ACL (p_host	    in	    varchar2,
		      p_lower_port  in	    number,
		      p_upper_port  in	    number default null)
is
begin
    DBMS_NETWORK_ACL_ADMIN.Assign_Acl (
    acl 	=> 'IAS_SYS.xml',
    host	=> p_host,
    lower_port	=> p_lower_port,
    upper_port	=> p_upper_port);
    commit;
end Assign_ACL ;

--##End Utilites


--##Egyption TAX
procedure Check_Doc_Status(p_doc_type	  in  number,
				 p_doc_ser	in  number,
				 p_sys_no	in  number default 61,
				 p_status	out varchar2,
				 p_error	out varchar2)
is
v_schema	    varchar2(20);
v_whr		    varchar2(4000);
v_tbl_nm	    varchar2(32);
v_fld_ser	    varchar2(32);
v_slct_stmnt	    varchar2(1000);
v_uuid		    varchar2(32);
v_guid		    varchar2(100);
v_url		    varchar2(2000);
v_content	    varchar2(1000);
v_jv_type	    number;
v_activity_unit     number;
v_curr_year	    number;
v_rspons_char	    varchar2(4000);
v_http_rspons_code  number;
v_obj		    pljson;
begin
    --getting the base url for the webservice
    select web_doc_lnk
    into v_url
    from ias_para_gen
    where rownum<=1;

    if v_url is null then
	raise_application_error(-20001,'Service Url is not set. Please set the service url in General Parameters');
    end if;

    select substr(sys_context( 'userenv', 'current_schema' ),8) into v_schema from dual;

    v_schema := case p_sys_no
		    when 61 then null
		    when 8 then 'YSPOS'||v_schema||'.'
		    else null end;

    --getting document detials
    V_WHR := ' WHERE DOC_TYP='||CASE WHEN P_SYS_NO = 80 AND P_DOC_TYPE = 4 THEN 130
				   WHEN P_SYS_NO = 80 AND P_DOC_TYPE = 5 THEN 131
				   ELSE P_DOC_TYPE END||' AND ROWNUM <= 1';

    V_TBL_NM := YS_GEN_PKG.GET_FLD_VALUE('GNR_DDC_TBL', 'TBL_MST_NM', V_WHR);
    V_FLD_SER := YS_GEN_PKG.GET_FLD_VALUE('GNR_DDC_TBL', 'TBL_DOCSRL_NM', V_WHR);

    V_WHR := V_TBL_NM||'.'||V_FLD_SER||' = '||P_DOC_SER;


    /*v_whr := ' WHERE DOC_TYPE='||P_DOC_TYPE||' AND ROWNUM<=1';
    v_tbl_nm:= YS_GEN_PKG.GET_FLD_VALUE('INV_V_DOC_TYPE', 'TB_MST', V_WHR);
    v_fld_ser:= YS_GEN_PKG.GET_FLD_VALUE('INV_V_DOC_TYPE', 'FLD_SER', V_WHR);
    V_WHR := V_TBL_NM||'.'||V_FLD_SER||' = '||P_DOC_SER;*/

    v_slct_stmnt := 'SELECT WEB_SRVC_UUID FROM '||V_TBL_NM||' WHERE '||V_WHR;
    execute immediate v_slct_stmnt into v_uuid;
    if v_uuid is null then
	raise_application_error(-20002,'Document UUID is null. The document has not been posted to Tax yet!.');
    end if;

    v_jv_type := case
		    when p_sys_no = 61 and p_doc_type = 4 then 0
		    when p_sys_no = 61 and p_doc_type = 5 then 2
		    when p_sys_no = 61 and p_doc_type = 15 then 4
		    when p_sys_no = 80 and p_doc_type = 4 then 1
		    when p_sys_no = 80 and p_doc_type = 5 then 5
		    when p_sys_no = 86 and p_doc_type = 4 then 6
		    when p_sys_no = 86 and p_doc_type = 5 then 7
		 end;

 /*if p_doc_type=4 then
	v_jv_type:=0;
    elsif p_doc_type=5 then
	v_jv_type:=2;
    elsif p_doc_type=15 then
	v_jv_type:=4;
    end if; */

    --get activity unit
    select substr(sys_context( 'userenv', 'current_schema' ),8),
	   substr(sys_context( 'userenv', 'current_schema' ),4,4)
    into v_activity_unit,
	 v_curr_year
    from dual;

    --seting up v_GUID and v_content
    v_GUID := utl_raw.cast_to_varchar2(utl_encode.base64_encode(
		    utl_raw.cast_to_raw((v_activity_unit||';'||
					     '0'||';'||
					     v_jv_type||';'||
					     v_curr_year||';0'))));
    v_content := '{
		      "UUID":"'||v_uuid||'",
		      "GUID":"'||v_guid||'"
		  }';

    --Calling the web service
    call_web_service_char(  v_url || '/api/tax/egy/CheckDocumentStatus',
		     'POST',
		     'application/json',
		     v_content,
		     v_rspons_char,
		     v_http_rspons_code,
		     null,
		     null);

    --Check Response
    if v_http_rspons_code <> 200 then
	raise_application_error(-20003,v_rspons_char);
    end if;

    v_obj    := pljson(v_rspons_char);
    p_status := pljson_ext.get_String(v_obj,'status');
    p_error  := pljson_ext.get_string(v_obj,'error');


    exception
	when no_data_found then
	    raise_application_error(-20004,'Unable to find the document. please check parameters : p_doc_type,p_doc_ser');
	when others then
	    raise;

end Check_Doc_Status ;
--EndEgyption TAX

procedure Get_Doc_As_File(  p_guid	   In	  varchar2,
			    p_file_type    In	  varchar2 default 'xml',
			    p_file_name    In	  varchar2 default null
			 )
is
v_base_url varchar2(1000);
v_rqust_url varchar2(2000);
v_response_blob blob;
v_http_rspons_code number;
v_action varchar2(10);
v_file_name varchar2(256);

v_file	    utl_file.file_type;
v_buffer    raw(32767);
v_Amount    Binary_Integer := 32767;
v_pos	    Integer := 1;
v_Blob_Len  Integer;
begin

    begin
	select WEB_DOC_LNK
	into v_base_url
	from ias_para_gen
	where rownum<=1;
    exception when others then
	raise_application_error(-20001, 'Error: Web Doc Link is not set then General Parameters.');
    end;

    v_rqust_url := v_base_url||'/doc/'||p_file_type||'/'||p_guid;

    Call_Web_Service_blob(p_url 	     => v_rqust_url,
			  p_method	     => 'GET',
			  p_content_type     => 'application/xml',
			  p_content	     => null,
			  p_response_blob    => v_response_blob,
			  p_http_rspons_code => v_http_rspons_code,
			  p_file_name	     => v_file_name,
			  p_wallet_path      => null,
			  p_wallet_pwd	     => null,
			  p_username	     => null,
			  p_password	     => null,
			  p_token	     => null);

    if v_http_rspons_code = 200 and v_file_name is not null then
	if p_file_name is not null then
	    v_file_name := p_file_name;
	end if;
	--##-------------------------------------------------------------##-
	v_Blob_len := dbms_lob.Getlength(v_response_blob);
	v_Pos := 1;
	--##-------------------------------------------------------------##-
	v_file := utl_file.fopen('E_INVOICE_FLS',v_file_name,'wb', 32767);
	--##-------------------------------------------------------------##-
	while v_pos < v_blob_len loop
	    dbms_lob.Read(v_response_blob,v_amount,v_pos,v_buffer);
	    utl_file.put_raw(v_file,v_buffer, true);
	    v_pos := v_pos + v_amount;
	end loop;
	--##-------------------------------------------------------------##-
	Utl_File.fclose(v_file);
	--##-------------------------------------------------------------##-
    else
	raise_application_error(-20001,'Error when getting the file. Http Response Code: '||v_http_rspons_code);
    end if;
    exception when others then
	if utl_file.is_open(v_file) then
	    utl_file.fclose(v_file);
	end if;
	raise;
end Get_Doc_As_File;


procedure Get_Doc_As_File(  P_jv_typ	   In	  number,
			    P_doc_ser	   In	  number,
			    P_brn_usr	   In	  number,
			    p_file_type    In	  varchar2 default 'xml',
			    p_file_name    out	   varchar2
			 )
is
v_guid varchar2(100);
v_base_url varchar2(1000);
v_rqust_url varchar2(2000);
v_response_blob blob;
v_http_rspons_code number;
v_action varchar2(10);
v_file_name varchar2(256);

v_file	    utl_file.file_type;
v_buffer    raw(32767);
v_Amount    Binary_Integer := 32767;
v_pos	    Integer := 1;
V_Blob	    Blob;
v_Blob_Len  Integer;

begin
    v_guid := utl_raw.cast_to_varchar2(
			utl_encode.base64_encode(
			    utl_raw.cast_to_raw((p_brn_usr||';'||
						     p_doc_ser||';'||
						     p_jv_typ||';0'))));

    begin
	select WEB_DOC_LNK
	into v_base_url
	from ias_para_gen
	where rownum<=1;
    exception when others then
	raise_application_error(-20001, 'Error: Web Doc Link is not set then General Parameters.');
    end;

    v_rqust_url := v_base_url||'/doc/'||p_file_type||'/'||v_guid;

    --dbms_output.put_line(v_rqust_url);

    Call_Web_Service_blob(p_url 	     => v_rqust_url,
			  p_method	     => 'GET',
			  p_content_type     => 'application/xml',
			  p_content	     => null,
			  p_response_blob    => v_response_blob,
			  p_http_rspons_code => v_http_rspons_code,
			  p_file_name	     => v_file_name,
			  p_wallet_path      => null,
			  p_wallet_pwd	     => null,
			  p_username	     => null,
			  p_password	     => null,
			  p_token	     => null);

    p_file_name := v_file_name;
    --##-------------------------------------------------------------##-
    v_Blob_len := dbms_lob.Getlength(v_response_blob);
    v_Pos := 1;
    --##-------------------------------------------------------------##-
    v_file := utl_file.fopen('E_INVOICE_FLS',v_file_name,'wb', 32767);
    --##-------------------------------------------------------------##-
    while v_pos < v_blob_len loop
	dbms_lob.Read(v_response_blob,v_amount,v_pos,v_buffer);
	utl_file.put_raw(v_file,v_buffer, true);
	v_pos := v_pos + v_amount;
    end loop;
    --##-------------------------------------------------------------##-
    Utl_File.fclose(v_file);
    --##-------------------------------------------------------------##-
    exception when others then
	if utl_file.is_open(v_file) then
	    utl_file.fclose(v_file);
	end if;
	raise;
end Get_Doc_As_File;

procedure SendEmailOverApi( P_jv_typ	     In     number,
			    P_hashed_doc_ser In     number,
			    P_brn_usr	     In     number,
			    p_subject	     In     varchar2,
			    p_message	     In     varchar2,
			    p_file_Name      In     varchar2 default null,
			    p_file_content   In     blob default null,
			    p_error	     out     varchar2)
is
v_guid		    varchar2(100);
v_rqust_url	    varchar2(1000);
v_base_url	    varchar2(1000);
v_content	    clob;
v_attachment	    clob;
v_obj		    pljson;
v_response_text     varchar2(32000);
v_http_rspons_code  number;
begin
    v_guid := utl_raw.cast_to_varchar2(
			utl_encode.base64_encode(
			    utl_raw.cast_to_raw((p_brn_usr||';'||
						     p_hashed_doc_ser||';'||
						     p_jv_typ||';0'))));

    begin
	select WEB_DOC_LNK
	into v_base_url
	from ias_para_gen
	where rownum<=1;
    exception when others then
	raise_application_error(-20001, 'Error: Web Doc Link is not set then General Parameters.');
    end;

    v_rqust_url := v_base_url||'/api/sendEmail';

    if p_file_content is not null then
	dbms_lob.createtemporary(v_attachment, true, dbms_lob.call);
	base64encode(p_file_content,v_attachment);
    end if;


    v_content := '{
		    "DocGUID":"'||v_guid||'",
		    "Subject":"'||p_subject||'",
		    "Message":"'||p_message||'",
		    "FileName":"'||p_file_name||'",
		    "AttachmentBase64":"'||v_attachment||'"
		  }';
    ias_web_srvc_pkg.Call_Web_Service_char(p_url		=> v_rqust_url,
					   p_method		=> 'POST',
					   p_content_type	=> 'application/json',
					   p_content		=> v_content,
					   p_response_text	=> v_response_text,
					   p_http_rspons_code	=> v_http_rspons_code,
					   p_wallet_path	=> null,
					   p_wallet_pwd 	=> null);
    if v_http_rspons_code <> 202 then
	if v_response_text is not null then
	    p_error := v_response_text;
	else
	    p_error := 'Unknown error';
	end if;
    end if;



/*exception when others then
    p_error := sqlerrm; */
end SendEmailOverApi;

PROCEDURE blob_to_file (p_blob	    IN	BLOB,
					  p_dir       IN  VARCHAR2,
					  p_filename  IN  VARCHAR2)
AS
  l_file      UTL_FILE.FILE_TYPE;
  l_buffer    RAW(32767);
  l_amount    BINARY_INTEGER := 32767;
  l_pos       INTEGER := 1;
  l_blob_len  INTEGER;
BEGIN
  l_blob_len := DBMS_LOB.getlength(p_blob);

  -- Open the destination file.
  l_file := UTL_FILE.fopen(p_dir, p_filename,'wb', 32767);

  -- Read chunks of the BLOB and write them to the file until complete.
  WHILE l_pos <= l_blob_len LOOP
    DBMS_LOB.read(p_blob, l_amount, l_pos, l_buffer);
    UTL_FILE.put_raw(l_file, l_buffer, TRUE);
    l_pos := l_pos + l_amount;
  END LOOP;

  -- Close the file.
  UTL_FILE.fclose(l_file);

EXCEPTION
  WHEN OTHERS THEN
    -- Close the file if something goes wrong.
    IF UTL_FILE.is_open(l_file) THEN
      UTL_FILE.fclose(l_file);
    END IF;
    RAISE;
END blob_to_file;

procedure base64encode ( p_blob 	in blob,
			 p_clob        in out nocopy clob )
is
    v_step			    pls_integer := 22500; -- make sure you set a multiple of 3 not higher than 24573
    v_converted 		    varchar2(32767);

    v_buffer_size_approx	    pls_integer := 1048576;
    v_buffer			    clob;
begin
    dbms_lob.createtemporary(v_buffer, true, dbms_lob.call);

    for i in 0 .. trunc((dbms_lob.getlength(p_blob) - 1 )/v_step) loop
	v_converted := utl_raw.cast_to_varchar2(utl_encode.base64_encode(dbms_lob.substr(p_blob, v_step, i * v_step + 1)));
	dbms_lob.writeappend(v_buffer, length(v_converted), v_converted);

	if dbms_lob.getlength(v_buffer) >= v_buffer_size_approx then
	    dbms_lob.append(p_clob, v_buffer);
	    dbms_lob.trim(v_buffer, 0);
	end if;
    end loop;

    dbms_lob.append(p_clob, v_buffer);

    dbms_lob.freetemporary(v_buffer);
end base64encode ;

PROCEDURE Get_Dashboard_Data(p_new	    out number,
			     p_success	    out number,
			     p_waiting	    out number,
			     p_declined     out number,
			     p_suspected    out number,
			     p_error	    out number)
is
v_url		    varchar2(2000);
v_rspons_char	    varchar2(4000);
v_http_rspons_code  number;
v_obj		    pljson;
begin
    select web_doc_lnk
    into v_url
    from ias_para_gen
    where rownum<=1;

    if v_url is null then
	raise_application_error(-20001, 'Service Url is not set. Please set the service url in General Parameters');
    end if;

    --Calling the web service
    call_web_service_char( v_url || '/api/tax/CheckDBData',
			    'GET',
			    'application/json',
			    null,
			    v_rspons_char,
			    v_http_rspons_code,
			    null,
			    null);

    --Check Response
    if v_http_rspons_code <> 200 then
	p_error := v_rspons_char;
	raise_application_error(-2003, v_rspons_char);
    end if;

    v_obj := pljson(v_rspons_char);

    p_new	:= pljson_ext.get_number(v_obj, 'New');
    p_success	:= pljson_ext.get_number(v_obj, 'Success');
    p_waiting	:= pljson_ext.get_number(v_obj, 'Waiting');
    p_declined	:= pljson_ext.get_number(v_obj, 'Declined');
    p_suspected := pljson_ext.get_number(v_obj, 'Suspected');
    exception
	when no_data_found then
	    p_error := sqlerrm;
end Get_Dashboard_Data ;
End Ias_Web_Srvc_Pkg ;
/
