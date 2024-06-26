import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import { confirm } from "@erxes/ui/src/utils";
import Alert from "@erxes/ui/src/utils/Alert";
import Button from "@erxes/ui/src/components/Button";
import { ModalTrigger } from "@erxes/ui/src/components";
import Icon from "@erxes/ui/src/components/Icon";
import Tip from "@erxes/ui/src/components/Tip";
import { Actions } from "@erxes/ui/src/styles/main";
import ClientPortalUserForm from "../../containers/ClientPortalUserForm";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import { IClientPortalUser } from "../../types";
import React from "react";
import SmsForm from "@erxes/ui-inbox/src/settings/integrations/containers/telnyx/SmsForm";
import { loadDynamicComponent, __ } from "@erxes/ui/src/utils";
// import ExtendSubscription from '@erxes/ui-forum/src/containers/ExtendSubscriptionForm';
import EmailWidget from "@erxes/ui-inbox/src/inbox/components/EmailWidget";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  clientPortalUser: IClientPortalUser;
  remove: () => void;
  isSmall?: boolean;
};

const BasicInfoSection: React.FC<Props> = ({
  clientPortalUser,
  remove,
  isSmall,
}: Props) => {
  const renderActions = () => {
    const { phone, email } = clientPortalUser;

    const smsForm = (props) => <SmsForm {...props} phone={phone} />;

    return (
      <>
        {(isEnabled("engages") || isEnabled("imap")) && (
          <EmailWidget
            disabled={email ? false : true}
            buttonStyle={email ? "primary" : "simple"}
            emailTo={email}
            customerId={clientPortalUser._id || undefined}
            buttonSize="small"
            type="action"
          />
        )}
        <ModalTrigger
          dialogClassName="middle"
          title={`Send SMS to (${phone})`}
          trigger={
            <Button
              disabled={phone ? false : true}
              size="small"
              btnStyle={phone ? "primary" : "simple"}
            >
              <Tip text="Send SMS" placement="top-end">
                <Icon icon="message" />
              </Tip>
            </Button>
          }
          content={smsForm}
        />
        <Button
          href={phone && `tel:${phone}`}
          size="small"
          btnStyle={phone ? "primary" : "simple"}
          disabled={phone ? false : true}
        >
          <Tip text="Call" placement="top-end">
            <Icon icon="phone" />
          </Tip>
        </Button>
      </>
    );
  };

  const renderButton = () => {
    return (
      <Button size="small" btnStyle="default">
        {isSmall ? (
          <Icon icon="ellipsis-h" />
        ) : (
          <>
            {__("Action")} <Icon icon="angle-down" />
          </>
        )}
      </Button>
    );
  };

  const renderEditButton = () => {
    const customerForm = (props) => {
      return (
        <ClientPortalUserForm
          {...props}
          size="lg"
          clientPortalUser={clientPortalUser}
        />
      );
    };

    return (
      <li>
        <ModalTrigger
          title="Edit basic info"
          trigger={<a href="#edit">{__("Edit")}</a>}
          size="lg"
          content={customerForm}
        />
      </li>
    );
  };

  const renderDropdown = () => {
    const onClick = () =>
      confirm()
        .then(() => remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    const extendSubscription = (props) => {
      if (!isEnabled("forum")) {
        return null;
      }

      // TODO: use loadDynamicComponent
      // return (
      //   <ExtendSubscription {...props} clientPortalUser={clientPortalUser} />
      // );
    };

    return (
      <Dropdown
        as={DropdownToggle}
        unmount={false}
        toggleComponent={renderButton()}
      >
        {renderEditButton()}
        {isEnabled("forum") && (
          <ModalTrigger
            title="Extend Subscription"
            trigger={
              <li>
                <a href="#extend-subscription">{__("Extend Subscription")}</a>
              </li>
            }
            size="lg"
            content={extendSubscription}
          />
        )}
        <li>
          <a href="#delete" onClick={onClick}>
            {__("Delete")}
          </a>
        </li>
      </Dropdown>
    );
  };

  return (
    <>
      {loadDynamicComponent(
        "clientPortalUserDetailAction",
        { clientPortalUser },
        true
      )}
      <Actions>
        {renderActions()}
        {renderDropdown()}
      </Actions>
    </>
  );
};

export default BasicInfoSection;
