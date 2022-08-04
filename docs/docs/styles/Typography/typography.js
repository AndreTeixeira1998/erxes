import React, { useState } from "react";
// import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import typography from "erxes-ui/lib/styles/typography";
import Alert from "erxes-ui/lib/utils/Alert/index";

export function TypoComponent(props) {
  const [copySuccess, setCopySuccess] = useState("");
  const { type, typographies = [] } = props;

  const copyToClipBoard = async (copyMe) => {
    try {
      await navigator.clipboard.writeText(copyMe);
      setCopySuccess(`Copied! (${copyMe})`);
      Alert.success(`Copied! (${copyMe})`);
    } catch (err) {
      setCopySuccess("Failed to copy!");
    }
  };

  const items = typographies.map((tpgphy, i) => {
    if (tpgphy.includes("Weight")) {
      return (
        <div
          key={i}
          onClick={() => {
            copyToClipBoard(tpgphy);
          }}
        >
          <p style={{ fontWeight: `${typography[tpgphy]}px` }}>
            {tpgphy} = {typography[tpgphy]}px
          </p>
        </div>
      );
    } else if (tpgphy.includes("Size")) {
      return (
        <div
          key={i}
          onClick={() => {
            copyToClipBoard(tpgphy);
          }}
        >
          <p style={{ fontSize: `${typography[tpgphy]}px` }}>
            {tpgphy} = {typography[tpgphy]}px
          </p>
        </div>
      );
    }

    return (
      <>
        <a
          onClick={() => {
            copyToClipBoard(tpgphy);
          }}
        >
          {tpgphy} = {typography[tpgphy]}px
        </a>
        <div key={i} style={{ lineHeight: typography[tpgphy] }}>
          <p>
            Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
            American former professional basketball player, coach and executive
            in the National Basketball Association (NBA).
          </p>
        </div>
      </>
    );
  });

  if (type === "import") {
    return (
      <CodeBlock className="language-jsx">{`import typography from "erxes-ui/lib/styles/typography";`}</CodeBlock>
    );
  }

  return (
    <>
      <div className={styles.sizeBox}>{items}</div>
    </>
  );
}
