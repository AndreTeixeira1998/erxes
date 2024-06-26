import {
  HeaderContent,
  HeaderRow,
  MetaInfo,
  TitleRow,
} from "@erxes/ui-cards/src/boards/styles/item";
import React, { useEffect, useState } from "react";

import { ColorButton } from "@erxes/ui-cards/src/boards/styles/common";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IGrowthHack } from "../../types";
import { IOptions } from "@erxes/ui-cards/src/boards/types";
import Move from "@erxes/ui-cards/src/boards/containers/editForm/Move";
import Participators from "@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/Participators";
import { PriorityIndicator } from "@erxes/ui-cards/src/boards/components/editForm";

type Props = {
  item: IGrowthHack;
  options: IOptions;
  saveItem: (doc: { [key: string]: any }) => void;
  onChangeStage: (stageId: string) => void;
  score?: () => React.ReactNode;
  dueDate?: React.ReactNode;
  number?: () => React.ReactNode;
};

function Top(props: Props) {
  const { item } = props;

  const [name, setName] = useState(item.name);

  useEffect(() => {
    setName(item.name);
  }, [item.name]);

  function renderMove() {
    const { options, onChangeStage } = props;

    return (
      <Move
        options={options}
        item={item}
        stageId={item.stageId}
        onChangeStage={onChangeStage}
      />
    );
  }

  function renderHackStage() {
    const hackStages = props.item.hackStages || [];

    if (hackStages.length === 0) {
      return null;
    }

    return (
      <ColorButton color="#666">
        {hackStages.map((i) => (
          <span key={i}>
            <PriorityIndicator value={i} />
            {i}
          </span>
        ))}
      </ColorButton>
    );
  }

  const { saveItem, score, dueDate, number } = props;
  const { assignedUsers = [], priority } = item;

  const onNameBlur = (e) => {
    if (item.name !== name) {
      saveItem({ name });
    }
  };

  const onChangeName = (e) => {
    setName(e.target.value);
  };

  return (
    <>
      <HeaderRow>
        <HeaderContent>
          <TitleRow>
            {priority && <PriorityIndicator value={priority} />}
            <FormControl
              componentclass="textarea"
              value={name}
              required={true}
              onBlur={onNameBlur}
              onChange={onChangeName}
            />
          </TitleRow>
          <MetaInfo>
            {assignedUsers.length > 0 && (
              <Participators participatedUsers={assignedUsers} limit={3} />
            )}
            {dueDate}
            {renderHackStage()}
          </MetaInfo>
        </HeaderContent>
        {number && number()}
        {score && score()}
      </HeaderRow>

      <HeaderRow>
        <HeaderContent>{renderMove()}</HeaderContent>
      </HeaderRow>
    </>
  );
}

export default Top;
