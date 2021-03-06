package com.song7749.dl.dbclient.entities;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import com.song7749.dl.base.Entities;
import com.song7749.util.validate.ValidateGroupDelete;
import com.song7749.util.validate.ValidateGroupInsert;
import com.song7749.util.validate.ValidateGroupUpdate;

/**
 * <pre>
 * Class Name : FavorityQuery.java
 * Description : 즐겨 찾는 쿼리 저장
*
*  Modification Information
*  Modify Date 		Modifier	Comment
*  -----------------------------------------------
*  2016. 1. 22.		song7749	신규작성
*
* </pre>
*
* @author song7749
* @since 2016. 1. 22.
*/

@Entity
public class FavorityQuery extends Entities {

	private static final long serialVersionUID = -2023838131271073409L;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@NotNull(groups={ValidateGroupUpdate.class,ValidateGroupDelete.class})
	private Integer favorityQuerySeq;


	// TODO Member ID 와 관계를 형성해야 한다.
	@Column
	@NotNull(groups={ValidateGroupInsert.class,ValidateGroupDelete.class})
	@Size(min=4,max=20)
	private String id;

	@Column
	@NotNull(groups={ValidateGroupInsert.class,ValidateGroupUpdate.class})
	@Size(min=4)
	private String memo;

	@Column
	@NotNull(groups={ValidateGroupInsert.class,ValidateGroupUpdate.class})
	@Size(min=10)
	private String query;

	@Column
	@NotNull(groups={ValidateGroupInsert.class,ValidateGroupUpdate.class})
	private Date inputDate;

	public FavorityQuery() {}

	public FavorityQuery(Integer favorityQuerySeq) {
		this.favorityQuerySeq = favorityQuerySeq;
	}

	public FavorityQuery(String id, String memo, String query, Date inputDate) {
		this.id = id;
		this.memo = memo;
		this.query = query;
		this.inputDate = inputDate;
	}

	public Integer getFavorityQuerySeq() {
		return favorityQuerySeq;
	}

	public void setFavorityQuerySeq(Integer favorityQuerySeq) {
		this.favorityQuerySeq = favorityQuerySeq;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getMemo() {
		return memo;
	}

	public void setMemo(String memo) {
		this.memo = memo;
	}

	public String getQuery() {
		return query;
	}

	public void setQuery(String query) {
		this.query = query;
	}

	public Date getInputDate() {
		return inputDate;
	}

	public void setInputDate(Date inputDate) {
		this.inputDate = inputDate;
	}
}