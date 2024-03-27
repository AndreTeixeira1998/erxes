import { ColorPick, ColorPicker, Flex } from "@erxes/ui/src/styles/main";
import { Dialog, Transition } from "@headlessui/react";
import {
  DialogContent,
  DialogWrapper,
  ModalOverlay,
} from "@erxes/ui/src/styles/main";
import { IBoard, IPipeline } from "@erxes/ui-cards/src/boards/types";
import { IButtonMutateProps, IFormProps, IOption } from "@erxes/ui/src/types";

import BoardNumberConfigs from "../../boards/components/numberConfig/BoardNumberConfigs";
import { Box } from "@erxes/ui-contacts/src/customers/styles";
import Button from "@erxes/ui/src/components/Button";
import { COLORS } from "@erxes/ui/src/constants/colors";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import { DateItem } from "../styles";
import { ExpandWrapper } from "@erxes/ui-settings/src/styles";
import Form from "@erxes/ui/src/components/form/Form";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import Popover from "@erxes/ui/src/components/Popover";
import React from "react";
import Select from "react-select";
import { SelectMemberStyled } from "@erxes/ui-cards/src/settings/boards/styles";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import TwitterPicker from "react-color/lib/Twitter";
import { __ } from "coreui/utils";
import client from "@erxes/ui/src/apolloClient";
import { colors } from "@erxes/ui/src/styles";
import { gql } from "@apollo/client";
import { metricOptions } from "../constants";
import { queries } from "../graphql";

type Props = {
  type: string;
  show: boolean;
  boardId?: string;
  pipeline?: IPipeline;
  boards: IBoard[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  visibility: string;
  selectedMemberIds: string[];
  backgroundColor: string;
  hackScoringType: string;
  templates: any[];
  templateId?: string;
  metric?: string;
  boardId: string;
  startDate?: Date;
  endDate?: Date;
  numberConfig?: string;
  numberSize?: string;
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { pipeline } = this.props;

    this.state = {
      visibility: pipeline ? pipeline.visibility || "public" : "public",
      selectedMemberIds: pipeline ? pipeline.memberIds || [] : [],
      backgroundColor:
        (pipeline && pipeline.bgColor) || colors.colorPrimaryDark,
      hackScoringType: (pipeline && pipeline.hackScoringType) || "ice",
      templates: [],
      templateId: pipeline ? pipeline.templateId : "",
      metric: pipeline ? pipeline.metric : "",
      startDate: pipeline ? pipeline.startDate : undefined,
      endDate: pipeline ? pipeline.endDate : undefined,
      boardId: props.boardId || "",
      numberConfig: (pipeline && pipeline.numberConfig) || "",
      numberSize: (pipeline && pipeline.numberSize) || "",
    };
  }

  getTemplates() {
    client
      .query({
        query: gql(queries.pipelineTemplates),
        variables: { type: "growthHack" },
      })
      .then(({ data }: { data: any }) => {
        if (data && data.pipelineTemplates) {
          this.setState({ templates: data.pipelineTemplates });
        }
      })
      .catch((error) => {
        console.log(error.message); // tslint:disable-line
      });
  }

  componentDidMount() {
    this.getTemplates();
  }

  onChangeVisibility = (e: React.FormEvent<HTMLElement>) => {
    this.setState({
      visibility: (e.currentTarget as HTMLInputElement).value,
    });
  };

  onChangeValue = <T extends keyof State>(key: T, value: State[T]) => {
    this.setState({ [key]: value } as unknown as Pick<State, keyof State>);
  };

  onDateInputChange = (type: string, date) => {
    if (type === "endDate") {
      this.setState({ endDate: date });
    } else {
      this.setState({ startDate: date });
    }
  };

  collectValues = (items) => {
    return items.map((item) => item.value);
  };

  onColorChange = (e) => {
    this.setState({ backgroundColor: e.hex });
  };

  onChangeNumber = (key: string, value: string) => {
    this.setState({ [key]: value } as any);
  };

  generateDoc = (values: {
    _id?: string;
    name: string;
    visibility: string;
  }) => {
    const { pipeline, type } = this.props;
    const {
      selectedMemberIds,
      backgroundColor,
      templateId,
      hackScoringType,
      startDate,
      endDate,
      metric,
      boardId,
      numberConfig,
      numberSize,
    } = this.state;
    const finalValues = values;

    if (pipeline) {
      finalValues._id = pipeline._id;
    }

    return {
      ...finalValues,
      type,
      boardId,
      memberIds: selectedMemberIds,
      bgColor: backgroundColor,
      templateId,
      hackScoringType,
      startDate,
      endDate,
      metric,
      numberConfig,
      numberSize,
    };
  };

  renderSelectMembers() {
    const { visibility, selectedMemberIds } = this.state;

    if (visibility === "public") {
      return;
    }
    const self = this;

    const onChange = (items) => {
      self.setState({ selectedMemberIds: items });
    };

    return (
      <FormGroup>
        <SelectMemberStyled>
          <ControlLabel>Members</ControlLabel>

          <SelectTeamMembers
            label="Choose members"
            name="selectedMemberIds"
            initialValue={selectedMemberIds}
            onSelect={onChange}
          />
        </SelectMemberStyled>
      </FormGroup>
    );
  }

  renderTemplates() {
    const { templates, templateId } = this.state;

    const templateOptions = templates.map((template) => ({
      value: template._id,
      label: template.name,
    }));

    const onChange = (item) => this.onChangeValue("templateId", item.value);

    return (
      <FormGroup>
        <ControlLabel>Template</ControlLabel>

        <Select
          placeholder={__("Choose template")}
          value={templateOptions.find((option) => option.value === templateId)}
          options={templateOptions}
          onChange={onChange}
          isClearable={false}
        />
      </FormGroup>
    );
  }

  renderBoards() {
    const { boards } = this.props;

    const boardOptions = boards.map((board) => ({
      value: board._id,
      label: board.name,
    }));

    const onChange = (item) => {
      this.onChangeValue("boardId", item.value);
    };

    return (
      <FormGroup>
        <ControlLabel required={true}>Campaign</ControlLabel>
        <Select
          placeholder={__("Choose a campaign")}
          value={boardOptions.find(
            (option) => option.value === this.state.boardId
          )}
          options={boardOptions}
          onChange={onChange}
          isClearable={false}
        />
      </FormGroup>
    );
  }

  renderBox(type, desc, formula) {
    const onClick = () => this.onChangeValue("hackScoringType", type);

    return (
      <Box selected={this.state.hackScoringType === type} onClick={onClick}>
        <b>{__(type)}</b>
        <p>
          {__(desc)} <strong>{formula}</strong>
        </p>
      </Box>
    );
  }

  renderNumberInput() {
    return (
      <FormGroup>
        <BoardNumberConfigs
          onChange={(key: string, conf: string) =>
            this.onChangeNumber(key, conf)
          }
          config={this.state.numberConfig || ""}
          size={this.state.numberSize || ""}
        />
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { pipeline, renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;
    const object = pipeline || ({} as IPipeline);
    const { startDate, endDate, metric, visibility } = this.state;

    const onChangeMetric = (item) => this.onChangeValue("metric", item.value);

    return (
      <div className="dialog-description">
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            autoFocus={true}
            required={true}
          />
        </FormGroup>

        {this.renderBoards()}

        <FormGroup>
          <ControlLabel>Scoring type</ControlLabel>

          <Flex>
            {this.renderBox(
              "ice",
              "Set the Impact, Confidence and Ease factors for your tasks. Final score is calculated by the formula:",
              "Impact * Confidence * Ease"
            )}
            {this.renderBox(
              "rice",
              "Set the Reach, Impact, Confidence and Effort factors for your tasks. Final score is calculated by the formula:",
              "(Reach * Impact * Confidence) / Effort"
            )}
            {this.renderBox(
              "pie",
              "Set the Potential, Importance and Ease factors for your tasks. Final score is calculated by the formula:",
              "(Potential + Importance + Ease) / 3"
            )}
          </Flex>
        </FormGroup>

        <FormGroup>
          <Flex>
            <DateItem>
              <ControlLabel required={true}>Start date</ControlLabel>
              <DateControl
                {...formProps}
                required={true}
                name="startDate"
                placeholder={__("Start date")}
                value={startDate}
                onChange={this.onDateInputChange.bind(this, "startDate")}
              />
            </DateItem>
            <DateItem>
              <ControlLabel required={true}>End date</ControlLabel>
              <DateControl
                {...formProps}
                required={true}
                name="endDate"
                placeholder={__("End date")}
                value={endDate}
                onChange={this.onDateInputChange.bind(this, "endDate")}
              />
            </DateItem>
          </Flex>
        </FormGroup>

        <Flex>
          <ExpandWrapper>
            <FormGroup>
              <ControlLabel>Metric</ControlLabel>
              <Select
                placeholder={__("Choose a metric")}
                value={metricOptions.find(
                  (option) => option.options.value === metric
                )}
                options={metricOptions}
                onChange={onChangeMetric}
                isClearable={false}
              />
            </FormGroup>
          </ExpandWrapper>
          <ExpandWrapper>
            <Flex>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel required={true}>Visibility</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="visibility"
                    componentclass="select"
                    value={visibility}
                    onChange={this.onChangeVisibility}
                  >
                    <option value="public">{__("Public")}</option>
                    <option value="private">{__("Private")}</option>
                  </FormControl>
                </FormGroup>
              </ExpandWrapper>
              <FormGroup>
                <ControlLabel>Background</ControlLabel>
                <Popover
                  placement="bottom"
                  trigger={
                    <ColorPick>
                      <ColorPicker
                        style={{
                          backgroundColor: this.state.backgroundColor,
                        }}
                      />
                    </ColorPick>
                  }
                >
                  <TwitterPicker
                    width="266px"
                    triangle="hide"
                    color={this.state.backgroundColor}
                    onChange={this.onColorChange}
                    colors={COLORS}
                  />
                </Popover>
              </FormGroup>
            </Flex>
          </ExpandWrapper>
        </Flex>

        {this.renderSelectMembers()}
        {this.renderTemplates()}
        {this.renderNumberInput()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: "pipeline",
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: pipeline,
          })}
        </ModalFooter>
      </div>
    );
  };

  render() {
    const { show, closeModal, pipeline } = this.props;

    if (!show) {
      return null;
    }

    return (
      <Transition appear show={show} as={React.Fragment}>
        <Dialog as="div" onClose={closeModal} className={`relative z-10`}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ModalOverlay />
          </Transition.Child>
          <DialogWrapper>
            <DialogContent>
              <Dialog.Panel className={`dialog-size-lg`}>
                <Dialog.Title as="h3">
                  {pipeline ? `${__("Edit project")}` : `${__("Add project")}`}
                  <Icon icon="times" size={24} onClick={closeModal} />
                </Dialog.Title>
                <Transition.Child>
                  <Form renderContent={this.renderContent} />
                </Transition.Child>
              </Dialog.Panel>
            </DialogContent>
          </DialogWrapper>
        </Dialog>
      </Transition>
    );
  }
}

export default PipelineForm;
