package com.song7749.dl.login.service;

import static com.song7749.util.LogMessageFormatter.format;

import java.util.Date;

import javax.annotation.Resource;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.song7749.dl.login.annotations.Login;
import com.song7749.dl.login.dto.DoLoginDTO;
import com.song7749.dl.member.entities.Member;
import com.song7749.dl.member.repositories.MemberRepository;
import com.song7749.dl.member.type.AuthType;
import com.song7749.log.dto.SaveMemberLoginLogDTO;
import com.song7749.log.service.LogManager;
import com.song7749.util.crypto.CryptoAES;

/**
 * <pre>
 * Class Name : CertificationLoginUtil.java
 * Description : 인증서버 로그인 유틸
*
*  Modification Information
*  Modify Date 		Modifier	Comment
* -----------------------------------------------
*  2014. 3. 14.		song7749	AP-20
*
* </pre>
*
* @author song7749
* @since 2014. 3. 14.
*/
@Service("loginManager")
public class LoginManagerImpl implements LoginManager{

	Logger logger = LoggerFactory.getLogger(getClass());

	// 로그인 정보 저장 쿠키 명칭
	private final String cipher = "cipher";

	@Resource
	MemberRepository memberRepository;

	@Autowired
	ApplicationContext context;

	@Autowired
	LogManager logManager;

	@Override
	public boolean isLogin(HttpServletRequest request) {
		return null!=getLoginID(request) ? true : false;
	}

	@Override
	@Valid
	@Transactional(value = "dbClientTransactionManager",readOnly=true)
	public boolean doLogin(DoLoginDTO dto,HttpServletRequest request,HttpServletResponse response){
		Member findMember = new Member(dto.getId());
		Member member = memberRepository.find(findMember);

		// 회원 정보가 조회가 되면.. 회원이 존재함.
		if(null != member){
			// 패스워드가 동일 함
			if(dto.getPassword().equals(member.getPassword())){
				// 로그인 cookie 정보를 생성 한다.
				Cookie ciperCookie = new Cookie(cipher,CryptoAES.encrypt(member.getId()));
				ciperCookie.setMaxAge(60*60*24);
				ciperCookie.setPath("/");
				response.addCookie(ciperCookie);

				// 로그인 로그 기록
				final SaveMemberLoginLogDTO logDto = new SaveMemberLoginLogDTO(
						dto.getId(),
						request.getRemoteAddr(),
						CryptoAES.encrypt(member.getId()),
						new Date());

				logger.debug(format("{}","Login Log"),logDto);
				// 서비스 실행기 로딩
				ThreadPoolTaskExecutor serviceExecutor = (ThreadPoolTaskExecutor) context.getBean("memberLoginLogExecutor");

				serviceExecutor.execute(new Runnable() {
					@Override
					public void run() {
						try {
							logManager.saveMemberLoginLog(logDto);
						} catch (TaskRejectedException e) {
							throw new TaskRejectedException("로그인 로그 기록 실패. 관리자에게 문의 바랍니다.");
						}
					}
				});

				return true;
			} else {
				throw new IllegalArgumentException("password=PASSWORD 가 일치하지 않습니다.");
			}
		}
		throw new IllegalArgumentException("id=존재하지 않는 ID 입니다.");
	}

	@Override
	public void doLogout(HttpServletResponse response) {
		Cookie cookie = new Cookie(cipher,"");
		cookie.setPath("/");
		response.addCookie(cookie);
	}

	@Override
	public String getLoginID(HttpServletRequest request) {
		String cipher = null;
		Cookie[] cookie = request.getCookies();

		// 쿠키에서 cipher 를 찾아낸다.
		if (cookie != null) {
			for (int i=0; i<cookie.length; i++) {
				if (null != cookie[i]
						&& cookie[i].getName().equals(this.cipher)) {

					cipher = cookie[i].getValue();
					// 복호화 된 ID 정보를 리턴한다.
					logger.debug(format("값 : {} , 길이 : {}","로그인 정보 복호화"),cipher,cipher.length());

					if(!StringUtils.isBlank(cipher) && cipher.length()>=24){
						logger.debug(format("{}","로그인 정보 복호화"),"복호화 성공");
						return CryptoAES.decrypt(cipher);
					}
				}
			}
		}
		return null;
	}

	/**
	 * 해당 회원이 접근 가능한 기능인가 검증
	 * @param member
	 * @param login
	 * @return boolean
	 */
	@Override
	@Transactional(value = "dbClientTransactionManager",readOnly=true)
	public boolean isAccese(HttpServletRequest request,Login login) {
		// 회원 로그인 정보에서 데이터를 가져와서 권한 여부를 판단한다.
		Member member = memberRepository.find(new Member(getLoginID(request)));

		// 회원이 아닌 경우 권한이 없다 - 모든 페이지를 작동 불능으로 처리한다.
		if(null!=member && null!=member.getAuthType()){
			for(AuthType at : login.value()){
				if(member.getAuthType().equals(at)){
					return true;
				}
			}
		}
		return false;
	}

	@Override
	public boolean isIdentification(HttpServletRequest request, String id) {
		return getLoginID(request) != null ? getLoginID(request).equals(id) : false;
	}
}