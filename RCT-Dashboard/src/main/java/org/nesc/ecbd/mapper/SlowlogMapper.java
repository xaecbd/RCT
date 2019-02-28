package org.nesc.ecbd.mapper;

import org.apache.ibatis.annotations.Select;
import org.nesc.ecbd.entity.SlowlogEntity;

import com.baomidou.mybatisplus.mapper.BaseMapper;

public interface SlowlogMapper extends BaseMapper<SlowlogEntity>{
    @Select("select id from slowlog where pid = #{pid}")
    public Long getSlowlogByPid(Long pid);

}
